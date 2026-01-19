import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../application/auth/ports/auth.repositories';
import { AuthUser } from '../../application/auth/auth.types';
import { PrismaClientLike } from './prisma.types';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClientLike) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
        },
        mfaSecret: true,
      },
    });
    return user ? this.toAuthUser(user) : null;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: { role: true },
        },
        mfaSecret: true,
      },
    });
    return user ? this.toAuthUser(user) : null;
  }

  async create(input: {
    email: string;
    passwordHash: string;
    fullName: string;
    userType: AuthUser['userType'];
    status: AuthUser['status'];
  }): Promise<AuthUser> {
    const { id: _id, ...data } = input as { id?: string } & typeof input;
    const user = await this.prisma.user.create({
      data,
      include: {
        roles: {
          include: { role: true },
        },
        mfaSecret: true,
      },
    });
    return this.toAuthUser(user);
  }

  async updateLastLogin(userId: string, at: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: at },
    });
  }


  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    passwordHash: string;
    status: string;
    userType: string;
    roles: { role: { name: string } }[];
    mfaSecret: { enabledAt: Date | null; disabledAt: Date | null } | null;
  }): AuthUser {
    const roles = user.roles.map((entry) => entry.role.name);
    if (roles.length === 0 && user.userType) {
      roles.push(user.userType);
    }
    const mfaEnabled = Boolean(user.mfaSecret?.enabledAt && !user.mfaSecret?.disabledAt);

    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      status: user.status as AuthUser['status'],
      userType: user.userType as AuthUser['userType'],
      roles,
      mfaEnabled,
    };
  }
}
