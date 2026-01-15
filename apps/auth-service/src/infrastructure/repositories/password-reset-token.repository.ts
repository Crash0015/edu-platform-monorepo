import { Injectable } from '@nestjs/common';
import { PasswordResetTokenRepository } from '../../application/auth/ports/auth.repositories';
import { PasswordResetTokenRecord } from '../../application/auth/auth.types';
import { PrismaClientLike } from './prisma.types';

@Injectable()
export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClientLike) {}

  async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    const token = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash },
    });
    return token
      ? {
          id: token.id,
          userId: token.userId,
          tokenHash: token.tokenHash,
          expiresAt: token.expiresAt,
          usedAt: token.usedAt,
        }
      : null;
  }

  async createToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    requestedIp: string | null;
    requestedUserAgent: string | null;
  }): Promise<PasswordResetTokenRecord> {
    const token = await this.prisma.passwordResetToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        requestedIp: input.requestedIp,
        requestedUserAgent: input.requestedUserAgent,
      },
    });
    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt,
    };
  }

  async markUsed(tokenId: string, usedAt: Date): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt },
    });
  }
}
