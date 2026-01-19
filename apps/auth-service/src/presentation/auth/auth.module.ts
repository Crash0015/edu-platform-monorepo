import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../../application/auth/auth.service';
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
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { OutboxModule } from '../../infrastructure/outbox/outbox.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaUserRepository } from '../../infrastructure/repositories/user.repository';
import { PrismaRefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { PrismaPasswordResetTokenRepository } from '../../infrastructure/repositories/password-reset-token.repository';
import { PrismaMfaSecretRepository } from '../../infrastructure/repositories/mfa-secret.repository';
import { PrismaAuthUnitOfWork } from '../../infrastructure/repositories/auth-unit-of-work';
import { BcryptPasswordHasher } from '../../infrastructure/security/password-hasher.service';
import { JwtTokenService } from '../../infrastructure/security/token.service';
import { EncryptionService } from '../../infrastructure/security/encryption.service';
import { OtpMfaService } from '../../infrastructure/security/mfa.service';
import { JwtStrategy } from '../../infrastructure/security/jwt.strategy';
import { LocalStrategy } from '../../infrastructure/security/local.strategy';

import { AuthController } from './auth.controller';

import { RateLimitGuard } from '../../shared/guards/rate-limit.guard';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    KafkaModule,
    OutboxModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET', ''),
          signOptions: {
            expiresIn: expiresIn as import('jsonwebtoken').SignOptions['expiresIn'],
          },
        };
      },
    }),

  ],
  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    EncryptionService,
    RateLimitGuard,
    JwtAuthGuard,
    RolesGuard,

    {
      provide: USER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaUserRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaRefreshTokenRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaPasswordResetTokenRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: MFA_SECRET_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaMfaSecretRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: AUTH_UNIT_OF_WORK,
      useClass: PrismaAuthUnitOfWork,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: MFA_SERVICE,
      useClass: OtpMfaService,
    },
  ],
  exports: [AuthService],

})
export class AuthModule {}
