import { AuthUser, MfaSecretRecord, PasswordResetTokenRecord, RefreshTokenRecord } from '../auth.types';

export type OutboxEventInput = {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  eventVersion: number;
  payload: Record<string, unknown>;
};

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
  updateLastLogin(userId: string, at: Date): Promise<void>;
  updatePassword(userId: string, passwordHash: string): Promise<void>;
}

export interface RefreshTokenRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  createToken(input: {
    userId: string;
    tokenHash: string;
    familyId: string;
    expiresAt: Date;
    createdIp: string | null;
    createdUserAgent: string | null;
  }): Promise<RefreshTokenRecord>;
  revokeToken(input: { tokenId: string; revokedAt: Date; replacedByTokenId?: string | null }): Promise<void>;
  revokeFamily(input: { familyId: string; revokedAt: Date }): Promise<number>;
  revokeUserTokens(input: { userId: string; revokedAt: Date }): Promise<number>;
}

export interface PasswordResetTokenRepository {
  findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRecord | null>;
  createToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    requestedIp: string | null;
    requestedUserAgent: string | null;
  }): Promise<PasswordResetTokenRecord>;
  markUsed(tokenId: string, usedAt: Date): Promise<void>;
}

export interface MfaSecretRepository {
  findByUserId(userId: string): Promise<MfaSecretRecord | null>;
  upsertSecret(input: { userId: string; secretEncrypted: string }): Promise<MfaSecretRecord>;
  enableSecret(userId: string, enabledAt: Date): Promise<void>;
  disableSecret(userId: string, disabledAt: Date): Promise<void>;
}

export interface OutboxRepository {
  enqueue(event: OutboxEventInput): Promise<void>;
  fetchPending(limit: number): Promise<Array<{ id: string; eventType: string; payload: Record<string, unknown>; attempts: number }>>;
  markSent(id: string, sentAt: Date): Promise<void>;
  markFailed(id: string, attempts: number, lastError: string, status: 'FAILED' | 'PENDING'): Promise<void>;
}

export type AuthRepositories = {
  userRepository: UserRepository;
  refreshTokenRepository: RefreshTokenRepository;
  passwordResetTokenRepository: PasswordResetTokenRepository;
  mfaSecretRepository: MfaSecretRepository;
  outboxRepository: OutboxRepository;
};

export interface AuthUnitOfWork {
  execute<T>(operation: (repositories: AuthRepositories) => Promise<T>): Promise<T>;
}
