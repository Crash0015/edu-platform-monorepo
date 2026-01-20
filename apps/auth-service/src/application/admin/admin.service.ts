import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AdminUserStatusDto, AdminUserTypeDto } from '../../presentation/admin/dto/admin.dto';
import { isInstitutionalEmail } from '../../shared/utils/email';
import { parseDurationToSeconds } from '../../shared/utils/duration';
import { PASSWORD_HASHER, TOKEN_SERVICE } from '../../shared/constants/tokens.constants';
import { PasswordHasher, TokenService } from '../auth/ports/auth.security';

type AdminUserRecord = {
  id: string;
  email: string;
  status: AdminUserStatusDto;
  userType: AdminUserTypeDto;
  roles: string[];
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  private get passwordResetSeconds(): number {
    const raw = this.configService.get<string>('PASSWORD_RESET_EXPIRES_IN', '30m');
    return parseDurationToSeconds(raw, 30 * 60);
  }

  private get frontendBaseUrl(): string {
    return this.configService.get<string>('FRONTEND_BASE_URL', 'http://localhost:3000');
  }

  async createUser(input: {
    email: string;
    fullName: string;
    userType: AdminUserTypeDto;
    status?: AdminUserStatusDto;
  }): Promise<{ user: AdminUserRecord; temporaryPassword: string }> {
    const normalizedEmail = input.email.toLowerCase();

    if (!isInstitutionalEmail(normalizedEmail)) {
      throw new BadRequestException({
        message: 'Validation failed',
        details: ['email must end with @uce.edu.ec'],
      });
    }

    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const placeholderPassword = this.generateTemporaryPassword();
    const passwordHash = await this.passwordHasher.hash(placeholderPassword);

    const created = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: input.fullName,
        userType: input.userType,
        status: input.status ?? AdminUserStatusDto.ACTIVE,
        passwordHash,
      },
      include: {
        roles: { include: { role: true } },
        mfaSecret: true,
      },
    });

    // Option: Send email with password or reset link here if needed
    // const resetLink = await this.createResetLink(created.id, created.email);
    // await this.sendResetEmail({ email: created.email, fullName: created.fullName ?? created.email, resetLink });

    return {
      user: this.mapUser(created),
      temporaryPassword: placeholderPassword,
    };
  }

  async listUsers(filters: {
    status?: AdminUserStatusDto;
    userType?: AdminUserTypeDto;
    email?: string;
    offset?: number;
    limit?: number;
  }): Promise<{ items: AdminUserRecord[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.userType) {
      where.userType = filters.userType;
    }
    if (filters.email) {
      where.email = { contains: filters.email, mode: 'insensitive' };
    }

    const take = Math.min(filters.limit ?? 25, 100);
    const skip = filters.offset ?? 0;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: { include: { role: true } },
          mfaSecret: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => this.mapUser(user)),
      total,
    };
  }

  async getUserById(userId: string): Promise<AdminUserRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        mfaSecret: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUser(user);
  }

  async updateUserStatus(userId: string, status: AdminUserStatusDto): Promise<AdminUserRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      include: {
        roles: { include: { role: true } },
        mfaSecret: true,
      },
    });

    return this.mapUser(updated);
  }

  async updateUserType(userId: string, userType: AdminUserTypeDto): Promise<AdminUserRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { userType },
      include: {
        roles: { include: { role: true } },
        mfaSecret: true,
      },
    });

    return this.mapUser(updated);
  }

  async resetUserMfa(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = await this.prisma.mfaSecret.findUnique({
      where: { userId },
    });

    if (!secret) {
      return 'MFA was not enabled for this user';
    }

    await this.prisma.mfaSecret.update({
      where: { userId },
      data: {
        enabledAt: null,
        disabledAt: new Date(),
      },
    });

    return 'MFA disabled successfully';
  }

  async getUsersReport(): Promise<{ total: number; active: number; suspended: number; byType: Record<string, number> }> {
    const [total, active, suspended, byTypeRaw] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.groupBy({
        by: ['userType'],
        orderBy: { userType: 'asc' },
        _count: { _all: true },
      }),
    ]) as [number, number, number, Array<{ userType: string; _count: { _all: number } }>];

    const byType: Record<string, number> = {
      STUDENT: 0,
      TEACHER: 0,
      ADMIN: 0,
    };

    for (const row of byTypeRaw) {
      byType[row.userType] = row._count._all;
    }

    return { total, active, suspended, byType };
  }

  private mapUser(user: {
    id: string;
    email: string;
    status: string;
    userType: string;
    roles: { role: { name: string } }[];
    mfaSecret: { enabledAt: Date | null; disabledAt: Date | null } | null;
    createdAt: Date;
    updatedAt: Date;
  }): AdminUserRecord {
    const roles = user.roles.map((entry) => entry.role.name);
    if (roles.length === 0 && user.userType) {
      roles.push(user.userType);
    }
    const mfaEnabled = Boolean(user.mfaSecret?.enabledAt && !user.mfaSecret?.disabledAt);

    return {
      id: user.id,
      email: user.email,
      status: user.status as AdminUserStatusDto,
      userType: user.userType as AdminUserTypeDto,
      roles,
      mfaEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private generateTemporaryPassword(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const length = 12;
    let result = '';
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * alphabet.length);
      result += alphabet[idx];
    }
    return `Tmp-${result}`;
  }

  private async createResetLink(userId: string, email: string): Promise<string> {
    const rawToken = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + this.passwordResetSeconds * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        requestedIp: null,
        requestedUserAgent: null,
      },
    });

    const baseUrl = this.frontendBaseUrl.replace(/\/$/, '');
    const resetPath = '/auth/reset-password';
    const url = `${baseUrl}${resetPath}?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;
    return url;
  }

  private async sendResetEmail(input: { email: string; fullName: string; resetLink: string }) {
    const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', '').trim();
    if (!notificationUrl) {
      this.logger.warn('NOTIFICATION_SERVICE_URL not set; skipping reset email dispatch');
      return;
    }

    const url = `${notificationUrl.replace(/\/$/, '')}/notifications/email`;
    const payload = {
      to: input.email,
      subject: 'Restablece tu acceso a la FCA',
      body: `Hola ${input.fullName},\n\nRecibiste acceso a la plataforma de la Facultad de Ciencias Administrativas. Para continuar, restablece tu contraseña usando este enlace:\n${input.resetLink}\n\nSi no solicitaste este acceso, ignora este mensaje.`,
      correlationId: randomUUID(),
    };

    const fetchFn = (global as any).fetch;
    if (!fetchFn) {
      this.logger.warn('Fetch is not available in this runtime; skipping reset email dispatch');
      return;
    }

    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`Notification service responded ${res.status}: ${text}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send reset email: ${message}`);
    }
  }
}
