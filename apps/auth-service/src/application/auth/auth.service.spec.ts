import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';

describe('AuthService', () => {
  const configService = {
    get: jest.fn(),
  } as any;

  const userRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateLastLogin: jest.fn(),
    updatePassword: jest.fn(),
  };


  const refreshTokenRepository = {
    findByTokenHash: jest.fn(),
    createToken: jest.fn(),
    revokeToken: jest.fn(),
    revokeFamily: jest.fn(),
    revokeUserTokens: jest.fn(),
  };

  const passwordResetTokenRepository = {
    findByTokenHash: jest.fn(),
    createToken: jest.fn(),
    markUsed: jest.fn(),
  };

  const mfaSecretRepository = {
    findByUserId: jest.fn(),
    upsertSecret: jest.fn(),
    enableSecret: jest.fn(),
    disableSecret: jest.fn(),
  };

  const outboxRepository = {
    enqueue: jest.fn(),
  };

  const unitOfWork = {
    execute: jest.fn(),
  };

  const passwordHasher = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokenService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    signMfaToken: jest.fn(),
    verifyMfaToken: jest.fn(),
    hashToken: jest.fn(),
    generateRandomToken: jest.fn(),
  };

  const mfaService = {
    createSetup: jest.fn(),
    verifyCode: jest.fn(),
  };

  const baseUser: AuthUser = {
    id: 'user-id',
    email: 'student@uce.edu.ec',
    passwordHash: 'hashed',
    status: 'ACTIVE',
    userType: 'STUDENT',
    roles: ['STUDENT'],
    mfaEnabled: false,
  };

  let service: AuthService;

  beforeEach(() => {
    jest.resetAllMocks();
    configService.get.mockImplementation((key: string, fallback: string) => {
      if (key === 'PASSWORD_RESET_EXPIRES_IN') {
        return '30m';
      }
      return fallback;
    });

    unitOfWork.execute.mockImplementation(async (operation: any) =>
      operation({
        userRepository,
        refreshTokenRepository,
        passwordResetTokenRepository,
        mfaSecretRepository,
        outboxRepository,
      }),
    );

    service = new AuthService(
      userRepository,
      refreshTokenRepository,
      passwordResetTokenRepository,
      mfaSecretRepository,
      unitOfWork,
      passwordHasher,
      tokenService,
      mfaService,
      configService,
    );
  });

  it('returns MFA challenge when enabled', async () => {
    userRepository.findByEmail.mockResolvedValue({ ...baseUser, mfaEnabled: true });
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.signMfaToken.mockResolvedValue({
      token: 'mfa-token',
      expiresIn: 300,
      expiresAt: new Date(),
    });

    const result = await service.login(
      { email: 'student@uce.edu.ec', password: 'Password123!' },
      { correlationId: 'corr', ip: '127.0.0.1', userAgent: 'jest' },
    );

    expect(result.mfaRequired).toBe(true);
    expect(result.mfaToken).toBe('mfa-token');
  });

  it('issues tokens on successful login', async () => {
    userRepository.findByEmail.mockResolvedValue(baseUser);
    passwordHasher.compare.mockResolvedValue(true);
    tokenService.signAccessToken.mockResolvedValue({
      token: 'access-token',
      expiresIn: 900,
      expiresAt: new Date(),
    });
    tokenService.signRefreshToken.mockResolvedValue({
      token: 'refresh-token',
      expiresIn: 604800,
      expiresAt: new Date(),
      familyId: 'family-id',
      jti: 'jti',
    });
    tokenService.hashToken.mockReturnValue('hashed-refresh');
    refreshTokenRepository.createToken.mockResolvedValue({
      id: 'refresh-id',
      userId: baseUser.id,
      tokenHash: 'hashed-refresh',
      familyId: 'family-id',
      expiresAt: new Date(),
      revokedAt: null,
      replacedByTokenId: null,
    });

    const result = await service.login(
      { email: 'student@uce.edu.ec', password: 'Password123!' },
      { correlationId: 'corr', ip: '127.0.0.1', userAgent: 'jest' },
    );

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(outboxRepository.enqueue).toHaveBeenCalled();
    expect(refreshTokenRepository.createToken).toHaveBeenCalled();
  });
});
