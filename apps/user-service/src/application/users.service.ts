import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  status: UserStatus;
  email: string;
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
  fullName?: string | null;
  identificationNumber?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly configService: ConfigService) {}

  async getUser(userId: string): Promise<UserProfile | null> {
    const authUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3001');
    const internalKey = this.configService.get<string>('AUTH_SERVICE_INTERNAL_KEY', '').trim();
    try {
      if (typeof fetch === 'undefined') {
        return null;
      }
      const headers: Record<string, string> = {};
      if (internalKey) {
        headers['x-internal-key'] = internalKey;
      }
      const response = await fetch(`${authUrl}/api/v1/internal/users/${userId}`, { headers });
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as {
        id: string;
        email: string;
        status: UserStatus;
        userType: UserProfile['userType'];
        fullName?: string | null;
        identificationNumber?: string | null;
      };
      return {
        id: payload.id,
        email: payload.email,
        status: payload.status,
        userType: payload.userType,
        fullName: payload.fullName ?? null,
        identificationNumber: payload.identificationNumber ?? null,
      };
    } catch {
      return null;
    }
  }
}
