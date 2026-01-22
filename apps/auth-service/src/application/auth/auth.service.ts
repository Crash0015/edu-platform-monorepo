import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  AUTH_UNIT_OF_WORK,
  MFA_SECRET_REPOSITORY,
  MFA_SERVICE,
  PASSWORD_HASHER,
  PASSWORD_RESET_TOKEN_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  TOKEN_SERVICE,
  USER_REPOSITORY,
} from '../../shared/constants/tokens.constants';
import { EVENT_TYPES } from '../../shared/constants/events.constants';
import { isInstitutionalEmail } from '../../shared/utils/email';
import { parseDurationToSeconds } from '../../shared/utils/duration';
import { RequestContext } from '../../shared/types/request-context';
import { buildEventEnvelope } from '../shared/event.factory';

import { AuthUser, LoginResult } from './auth.types';

import { AuthUnitOfWork, MfaSecretRepository, PasswordResetTokenRepository, RefreshTokenRepository, UserRepository } from './ports/auth.repositories';
import { MfaService, PasswordHasher, TokenService } from './ports/auth.security';

const DEFAULT_PASSWORD_RESET_SECONDS = 30 * 60;

@Injectable()
export class AuthService {
  private readonly passwordResetSeconds: number;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    @Inject(MFA_SECRET_REPOSITORY)
    private readonly mfaSecretRepository: MfaSecretRepository,
    @Inject(AUTH_UNIT_OF_WORK)
    private readonly unitOfWork: AuthUnitOfWork,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(MFA_SERVICE)
    private readonly mfaService: MfaService,
    private readonly configService: ConfigService,
  ) {
    this.passwordResetSeconds = parseDurationToSeconds(
      this.configService.get<string>('PASSWORD_RESET_EXPIRES_IN', '30m'),
      DEFAULT_PASSWORD_RESET_SECONDS,
    );
  }

  async login(input: { email: string; password: string }, context: RequestContext): Promise<LoginResult> {
    const user = await this.validateUser(input.email, input.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled) {
      const mfaToken = await this.tokenService.signMfaToken({ userId: user.id, email: user.email });
      return {
        mfaRequired: true,
        mfaToken: mfaToken.token,
        challengeExpiresIn: mfaToken.expiresIn,
      };
    }

    const tokens = await this.issueTokens(user, context, 'PASSWORD');
    return {
      ...tokens,
      mfaRequired: false,
    };
  }

  async register(input: { email: string; password: string; fullName: string; userType: AuthUser['userType'] }, context: RequestContext) {
    const normalizedEmail = input.email.toLowerCase();
    if (!isInstitutionalEmail(normalizedEmail)) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: ['email is invalid'],
      });
    }

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = await this.unitOfWork.execute(async (repositories) => {
      const created = await repositories.userRepository.create({
        email: normalizedEmail,
        passwordHash,
        fullName: input.fullName,
        userType: input.userType,
        status: 'ACTIVE',
      });

      const event = buildEventEnvelope({
        eventType: EVENT_TYPES.USER_CREATED,
        correlationId: context.correlationId,
        actorUserId: created.id,
        payload: {
          user_id: created.id,
          email: created.email,
          user_type: created.userType,
          status: created.status,
        },
      });

      await repositories.outboxRepository.enqueue({
        aggregateType: 'user',
        aggregateId: created.id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        payload: event,
      });

      return created;
    });

    return {
      id: user.id,
      email: user.email,
      status: user.status,
      userType: user.userType,
    };
  }

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const normalizedEmail = email.toLowerCase();
    if (!isInstitutionalEmail(normalizedEmail)) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: ['email is invalid'],
      });
    }

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    const passwordValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordValid) {
      return null;
    }

    return user;
  }


  async loginWithMfa(input: { mfaToken: string; code: string }, context: RequestContext) {
    const payload = await this.tokenService.verifyMfaToken(input.mfaToken);
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.mfaEnabled || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid MFA challenge');
    }

    const secret = await this.mfaSecretRepository.findByUserId(user.id);
    if (!secret || !secret.enabledAt || secret.disabledAt) {
      throw new UnauthorizedException('Invalid MFA challenge');
    }

    const valid = this.mfaService.verifyCode(secret.secretEncrypted, input.code);
    if (!valid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    return this.issueTokens(user, context, 'PASSWORD');
  }

  async refresh(input: { refreshToken: string }, context: RequestContext) {
    const payload = await this.tokenService.verifyRefreshToken(input.refreshToken);
    const tokenHash = this.tokenService.hashToken(input.refreshToken);
    const existing = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    const now = new Date();

    if (
      !existing ||
      existing.revokedAt ||
      existing.replacedByTokenId ||
      existing.expiresAt.getTime() <= now.getTime() ||
      existing.userId !== payload.userId
    ) {
      await this.refreshTokenRepository.revokeFamily({ familyId: payload.familyId, revokedAt: now });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });
    const refreshToken = await this.tokenService.signRefreshToken({
      userId: user.id,
      familyId: payload.familyId,
    });
    const refreshTokenHash = this.tokenService.hashToken(refreshToken.token);

    await this.unitOfWork.execute(async (repositories) => {
      const created = await repositories.refreshTokenRepository.createToken({
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId: payload.familyId,
        expiresAt: refreshToken.expiresAt,
        createdIp: context.ip,
        createdUserAgent: context.userAgent,
      });
      await repositories.refreshTokenRepository.revokeToken({
        tokenId: existing.id,
        revokedAt: now,
        replacedByTokenId: created.id,
      });
    });

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      expiresIn: accessToken.expiresIn,
      tokenType: 'Bearer',
    };
  }

  async logout(input: { refreshToken: string; revokeFamily?: boolean }) {
    let payload: { userId: string; familyId: string; jti: string } | null = null;

    try {
      payload = await this.tokenService.verifyRefreshToken(input.refreshToken);
    } catch {
      return { message: 'Logged out successfully' };
    }

    const now = new Date();
    const tokenHash = this.tokenService.hashToken(input.refreshToken);
    const existing = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!existing) {
      return { message: 'Logged out successfully' };
    }

    if (input.revokeFamily) {
      await this.refreshTokenRepository.revokeFamily({ familyId: payload.familyId, revokedAt: now });
    } else {
      await this.refreshTokenRepository.revokeToken({
        tokenId: existing.id,
        revokedAt: now,
        replacedByTokenId: null,
      });
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(input: { email: string }, context: RequestContext) {
    const normalizedEmail = input.email.toLowerCase();
    if (!isInstitutionalEmail(normalizedEmail)) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: ['email is invalid'],
      });
    }

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (user && user.status === 'ACTIVE') {
      const rawToken = this.tokenService.generateRandomToken();
      const tokenHash = this.tokenService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + this.passwordResetSeconds * 1000);

      const event = buildEventEnvelope({
        eventType: EVENT_TYPES.PASSWORD_RESET_REQUESTED,
        correlationId: context.correlationId,
        actorUserId: user.id,
        payload: {
          user_id: user.id,
          email: user.email,
          expires_at: expiresAt.toISOString(),
        },
      });

      await this.unitOfWork.execute(async (repositories) => {
        await repositories.passwordResetTokenRepository.createToken({
          userId: user.id,
          tokenHash,
          expiresAt,
          requestedIp: context.ip,
          requestedUserAgent: context.userAgent,
        });
        await repositories.outboxRepository.enqueue({
          aggregateType: 'user',
          aggregateId: user.id,
          eventType: event.event_type,
          eventVersion: event.event_version,
          payload: event,
        });
      });
    }

    return { message: 'If the email exists, a reset link will be sent.' };
  }

  async resetPassword(input: { token: string; newPassword: string }, context: RequestContext) {
    const tokenHash = this.tokenService.hashToken(input.token);
    const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);
    const now = new Date();

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() <= now.getTime()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user || !isInstitutionalEmail(user.email)) {
      throw new BadRequestException('Invalid or expired token');
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.PASSWORD_RESET_COMPLETED,
      correlationId: context.correlationId,
      actorUserId: user.id,
      payload: {
        user_id: user.id,
        email: user.email,
      },
    });

    await this.unitOfWork.execute(async (repositories) => {
      await repositories.passwordResetTokenRepository.markUsed(resetToken.id, now);
      await repositories.userRepository.updatePassword(user.id, passwordHash);
      await repositories.refreshTokenRepository.revokeUserTokens({ userId: user.id, revokedAt: now });
      await repositories.outboxRepository.enqueue({
        aggregateType: 'user',
        aggregateId: user.id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        payload: event,
      });
    });

    return { message: 'Password reset successful' };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      mfaEnabled: user.mfaEnabled,
      status: user.status,
    };
  }

  async setupMfa(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const setup = await this.mfaService.createSetup(user.email);
    await this.mfaSecretRepository.upsertSecret({
      userId: user.id,
      secretEncrypted: setup.encryptedSecret,
    });

    return {
      secret: setup.secret,
      otpauthUrl: setup.otpauthUrl,
      qrCodeDataUrl: setup.qrCodeDataUrl,
    };
  }

  async verifyMfa(userId: string, code: string) {
    const secret = await this.mfaSecretRepository.findByUserId(userId);
    if (!secret) {
      throw new BadRequestException('MFA secret not found');
    }

    const valid = this.mfaService.verifyCode(secret.secretEncrypted, code);
    if (!valid) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.mfaSecretRepository.enableSecret(userId, new Date());

    return { message: 'MFA enabled successfully' };
  }

  async disableMfa(userId: string, password: string, code: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const secret = await this.mfaSecretRepository.findByUserId(userId);
    if (!secret) {
      throw new BadRequestException('MFA secret not found');
    }

    const valid = this.mfaService.verifyCode(secret.secretEncrypted, code);
    if (!valid) {
      throw new BadRequestException('Invalid MFA code');
    }

    await this.mfaSecretRepository.disableSecret(userId, new Date());
    return { message: 'MFA disabled successfully' };
  }

  async verifyAccessToken(token: string) {
    return this.tokenService.verifyAccessToken(token);
  }

  private async issueTokens(user: AuthUser, context: RequestContext, loginMethod: 'PASSWORD' | 'REFRESH_TOKEN') {

    const accessToken = await this.tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });
    const familyId = randomUUID();
    const refreshToken = await this.tokenService.signRefreshToken({ userId: user.id, familyId });
    const refreshTokenHash = this.tokenService.hashToken(refreshToken.token);
    const now = new Date();

    const event = buildEventEnvelope({
      eventType: EVENT_TYPES.USER_LOGGED_IN,
      correlationId: context.correlationId,
      actorUserId: user.id,
      payload: {
        user_id: user.id,
        email: user.email,
        login_method: loginMethod,
        ip: context.ip,
        user_agent: context.userAgent,
      },
    });

    await this.unitOfWork.execute(async (repositories) => {
      await repositories.refreshTokenRepository.createToken({
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt: refreshToken.expiresAt,
        createdIp: context.ip,
        createdUserAgent: context.userAgent,
      });
      await repositories.userRepository.updateLastLogin(user.id, now);
      await repositories.outboxRepository.enqueue({
        aggregateType: 'user',
        aggregateId: user.id,
        eventType: event.event_type,
        eventVersion: event.event_version,
        payload: event,
      });
    });

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      expiresIn: accessToken.expiresIn,
      tokenType: 'Bearer',
    };
  }
}
