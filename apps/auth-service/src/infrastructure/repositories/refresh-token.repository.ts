import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../application/auth/ports/auth.repositories';
import { RefreshTokenRecord } from '../../application/auth/auth.types';
import { PrismaClientLike } from './prisma.types';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClientLike) {}

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
    return token
      ? {
          id: token.id,
          userId: token.userId,
          tokenHash: token.tokenHash,
          familyId: token.familyId,
          expiresAt: token.expiresAt,
          revokedAt: token.revokedAt,
          replacedByTokenId: token.replacedByTokenId,
        }
      : null;
  }

  async createToken(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    createdIp: string | null;
    createdUserAgent: string | null;
  }): Promise<RefreshTokenRecord> {
    const token = await this.prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        familyId: input.familyId,
        expiresAt: input.expiresAt,
        createdIp: input.createdIp,
        createdUserAgent: input.createdUserAgent,
      },
    });

    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      familyId: token.familyId,
      expiresAt: token.expiresAt,
      revokedAt: token.revokedAt,
      replacedByTokenId: token.replacedByTokenId,
    };
  }

  async revokeToken(input: {
    tokenId: string;
    revokedAt: Date;
    replacedByTokenId?: string | null;
  }): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: input.tokenId },
      data: {
        revokedAt: input.revokedAt,
        replacedByTokenId: input.replacedByTokenId ?? null,
      },
    });
  }

  async revokeFamily(input: { familyId: string; revokedAt: Date }): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        familyId: input.familyId,
        revokedAt: null,
      },
      data: {
        revokedAt: input.revokedAt,
      },
    });
    return result.count;
  }

  async revokeUserTokens(input: { userId: string; revokedAt: Date }): Promise<number> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        userId: input.userId,
        revokedAt: null,
      },
      data: { revokedAt: input.revokedAt },
    });
    return result.count;
  }
}
