import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { execSync } from 'child_process';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';

describe('AuthService (e2e)', () => {
  let app: INestApplication;
  let postgres: StartedTestContainer;
  let redis: StartedTestContainer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    postgres = await new GenericContainer('postgres:16')
      .withEnvironment({
        POSTGRES_USER: 'test',
        POSTGRES_PASSWORD: 'test',
        POSTGRES_DB: 'auth',
      })
      .withExposedPorts(5432)
      .start();

    redis = await new GenericContainer('redis:7').withExposedPorts(6379).start();

    const databaseUrl = `postgresql://test:test@${postgres.getHost()}:${postgres.getMappedPort(5432)}/auth`;
    const redisUrl = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`;

    process.env.DATABASE_URL = databaseUrl;
    process.env.REDIS_URL = redisUrl;
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.TOKEN_HASH_SECRET = 'test-token-hash-secret';
    process.env.MFA_CHALLENGE_SECRET = 'test-mfa-secret';
    process.env.MFA_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    process.env.MFA_ISSUER = 'UCE Auth';
    process.env.KAFKA_ENABLED = 'false';
    process.env.SWAGGER_ENABLED = 'false';
    process.env.RATE_LIMIT_LOGIN_MAX = '100';
    process.env.RATE_LIMIT_REFRESH_MAX = '100';
    process.env.RATE_LIMIT_FORGOT_MAX = '100';
    process.env.RATE_LIMIT_RESET_MAX = '100';

    execSync('npx prisma migrate deploy', {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });

    prisma = new PrismaClient({ datasourceUrl: databaseUrl });
    await prisma.$connect();

    const role = await prisma.role.create({
      data: {
        name: 'STUDENT',
        description: 'Student',
      },
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'student@uce.edu.ec',
        passwordHash,
        status: 'ACTIVE',
        fullName: 'Student User',
        userType: 'STUDENT',
      },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (prisma) {
      await prisma.$disconnect();
    }
    if (postgres) {
      await postgres.stop();
    }
    if (redis) {
      await redis.stop();
    }
  });

  it('rotates refresh tokens and rejects reuse', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'student@uce.edu.ec', password: 'Password123!' })
      .expect(200);

    expect(loginResponse.body.accessToken).toBeDefined();
    expect(loginResponse.body.refreshToken).toBeDefined();
    expect(loginResponse.body.mfaRequired).toBe(false);

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })
      .expect(200);

    expect(refreshResponse.body.refreshToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).not.toEqual(loginResponse.body.refreshToken);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken })
      .expect(401);
  });
});
