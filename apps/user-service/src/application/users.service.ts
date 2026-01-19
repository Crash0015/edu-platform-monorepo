import { Injectable } from '@nestjs/common';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserProfile {
  id: string;
  status: UserStatus;
  email: string;
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

@Injectable()
export class UsersService {
  private readonly users = new Map<string, UserProfile>();

  constructor() {
    this.users.set('11111111-1111-1111-1111-111111111111', {
      id: '11111111-1111-1111-1111-111111111111',
      status: 'ACTIVE',
      email: 'student@uce.edu.ec',
      userType: 'STUDENT',
    });
  }

  getUser(userId: string): UserProfile | null {
    return this.users.get(userId) ?? null;
  }
}
