export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type UserType = 'TEACHER' | 'STUDENT' | 'ADMIN';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  userType: UserType;
  roles: string[];
  mfaEnabled: boolean;
};

export type LoginResult = {
  mfaRequired: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  mfaToken?: string;
  challengeExpiresIn?: number;
};


export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  replacedByTokenId: string | null;
};

export type PasswordResetTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export type MfaSecretRecord = {
  id: string;
  userId: string;
  secretEncrypted: string;
  enabledAt: Date | null;
  disabledAt: Date | null;
};
