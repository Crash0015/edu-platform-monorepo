import { Injectable } from '@nestjs/common';
import { MfaSecretRepository } from '../../application/auth/ports/auth.repositories';
import { MfaSecretRecord } from '../../application/auth/auth.types';
import { PrismaClientLike } from './prisma.types';

@Injectable()
export class PrismaMfaSecretRepository implements MfaSecretRepository {
  constructor(private readonly prisma: PrismaClientLike) {}

  async findByUserId(userId: string): Promise<MfaSecretRecord | null> {
    const secret = await this.prisma.mfaSecret.findUnique({
      where: { userId },
    });
    return secret
      ? {
          id: secret.id,
          userId: secret.userId,
          secretEncrypted: secret.secretEncrypted,
          enabledAt: secret.enabledAt,
          disabledAt: secret.disabledAt,
        }
      : null;
  }

  async upsertSecret(input: { userId: string; secretEncrypted: string }): Promise<MfaSecretRecord> {
    const secret = await this.prisma.mfaSecret.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        secretEncrypted: input.secretEncrypted,
      },
      update: {
        secretEncrypted: input.secretEncrypted,
        enabledAt: null,
        disabledAt: null,
      },
    });

    return {
      id: secret.id,
      userId: secret.userId,
      secretEncrypted: secret.secretEncrypted,
      enabledAt: secret.enabledAt,
      disabledAt: secret.disabledAt,
    };
  }

  async enableSecret(userId: string, enabledAt: Date): Promise<void> {
    await this.prisma.mfaSecret.update({
      where: { userId },
      data: {
        enabledAt,
        disabledAt: null,
      },
    });
  }

  async disableSecret(userId: string, disabledAt: Date): Promise<void> {
    await this.prisma.mfaSecret.update({
      where: { userId },
      data: {
        disabledAt,
      },
    });
  }
}
