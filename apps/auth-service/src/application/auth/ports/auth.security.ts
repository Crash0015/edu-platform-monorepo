export type AccessTokenResult = {
  token: string;
  expiresIn: number;
  expiresAt: Date;
};

export type RefreshTokenResult = {
  token: string;
  expiresIn: number;
  expiresAt: Date;
  familyId: string;
  jti: string;
};

export type MfaTokenResult = {
  token: string;
  expiresIn: number;
  expiresAt: Date;
};

export interface PasswordHasher {
  hash(value: string): Promise<string>;
  compare(value: string, hashed: string): Promise<boolean>;
}

export interface TokenService {
  signAccessToken(input: { userId: string; email: string; roles: string[] }): Promise<AccessTokenResult>;
  signRefreshToken(input: { userId: string; familyId: string }): Promise<RefreshTokenResult>;
  verifyRefreshToken(token: string): Promise<{ userId: string; familyId: string; jti: string }>;
  signMfaToken(input: { userId: string; email: string }): Promise<MfaTokenResult>;
  verifyMfaToken(token: string): Promise<{ userId: string; email: string }>;
  verifyAccessToken(token: string): Promise<{ userId: string; email: string; roles: string[] }>;
  hashToken(token: string): string;
  generateRandomToken(): string;
}


export interface MfaService {
  createSetup(email: string): Promise<{
    secret: string;
    otpauthUrl: string;
    qrCodeDataUrl: string;
    encryptedSecret: string;
  }>;
  verifyCode(encryptedSecret: string, code: string): boolean;
}
