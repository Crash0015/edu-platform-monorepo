import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHmac, randomUUID } from 'crypto';
import { parseDurationToSeconds } from '../../shared/utils/duration';
import { TokenService } from '../../application/auth/ports/auth.security';

const DEFAULT_ACCESS_SECONDS = 15 * 60;
const DEFAULT_REFRESH_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_MFA_SECONDS = 5 * 60;

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly mfaSecret: string;
  private readonly hashSecret: string;
  private readonly accessSeconds: number;
  private readonly refreshSeconds: number;
  private readonly mfaSeconds: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET', '');
    this.refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', '');
    this.mfaSecret = this.configService.get<string>('MFA_CHALLENGE_SECRET', this.accessSecret);
    this.hashSecret = this.configService.get<string>('TOKEN_HASH_SECRET', '');
    this.accessSeconds = parseDurationToSeconds(
      this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      DEFAULT_ACCESS_SECONDS,
    );
    this.refreshSeconds = parseDurationToSeconds(
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      DEFAULT_REFRESH_SECONDS,
    );
    this.mfaSeconds = parseDurationToSeconds(
      this.configService.get<string>('MFA_CHALLENGE_EXPIRES_IN', '5m'),
      DEFAULT_MFA_SECONDS,
    );

    if (!this.accessSecret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    if (!this.refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    if (!this.hashSecret) {
      throw new Error('TOKEN_HASH_SECRET is not configured');
    }
  }

  async signAccessToken(input: { userId: string; email: string; roles: string[] }) {
    const expiresIn = this.accessSeconds;
    const token = await this.jwtService.signAsync(
      {
        sub: input.userId,
        email: input.email,
        roles: input.roles,
        type: 'access',
      },
      {
        secret: this.accessSecret,
        expiresIn,
      },
    );
    return {
      token,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  async signRefreshToken(input: { userId: string; familyId: string }) {
    const expiresIn = this.refreshSeconds;
    const jti = randomUUID();
    const token = await this.jwtService.signAsync(
      {
        sub: input.userId,
        familyId: input.familyId,
        jti,
        type: 'refresh',
      },
      {
        secret: this.refreshSecret,
        expiresIn,
      },
    );
    return {
      token,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
      familyId: input.familyId,
      jti,
    };
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.refreshSecret,
      });
      if (payload?.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return {
        userId: payload.sub as string,
        familyId: payload.familyId as string,
        jti: payload.jti as string,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signMfaToken(input: { userId: string; email: string }) {
    const expiresIn = this.mfaSeconds;
    const token = await this.jwtService.signAsync(
      {
        sub: input.userId,
        email: input.email,
        type: 'mfa',
      },
      {
        secret: this.mfaSecret,
        expiresIn,
      },
    );
    return {
      token,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    };
  }

  async verifyMfaToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.mfaSecret,
      });
      if (payload?.type !== 'mfa') {
        throw new UnauthorizedException('Invalid MFA token');
      }
      return {
        userId: payload.sub as string,
        email: payload.email as string,
      };
    } catch {
      throw new UnauthorizedException('Invalid MFA token');
    }
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.accessSecret,
      });
      if (payload?.type !== 'access') {
        throw new UnauthorizedException('Invalid access token');
      }
      return {
        userId: payload.sub as string,
        email: payload.email as string,
        roles: (payload.roles as string[]) ?? [],
      };
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  hashToken(token: string): string {
    return createHmac('sha256', this.hashSecret).update(token).digest('hex');
  }

  generateRandomToken(): string {
    return randomBytes(32).toString('base64url');
  }

}
