import { Injectable } from '@nestjs/common';
import { AuthRepositories, AuthUnitOfWork } from '../../application/auth/ports/auth.repositories';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaUserRepository } from './user.repository';
import { PrismaRefreshTokenRepository } from './refresh-token.repository';
import { PrismaPasswordResetTokenRepository } from './password-reset-token.repository';
import { PrismaMfaSecretRepository } from './mfa-secret.repository';
import { PrismaOutboxRepository } from './outbox.repository';

@Injectable()
export class PrismaAuthUnitOfWork implements AuthUnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(operation: (repositories: AuthRepositories) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const repositories: AuthRepositories = {
        userRepository: new PrismaUserRepository(tx),
        refreshTokenRepository: new PrismaRefreshTokenRepository(tx),
        passwordResetTokenRepository: new PrismaPasswordResetTokenRepository(tx),
        mfaSecretRepository: new PrismaMfaSecretRepository(tx),
        outboxRepository: new PrismaOutboxRepository(tx),
      };

      return operation(repositories);
    });
  }
}
