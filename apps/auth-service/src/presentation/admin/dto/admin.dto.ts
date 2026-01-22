import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AdminUserStatusDto {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum AdminUserTypeDto {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export class AdminUserQueryDto {
  @ApiPropertyOptional({ enum: AdminUserStatusDto })
  @IsEnum(AdminUserStatusDto)
  @IsOptional()
  status?: AdminUserStatusDto;

  @ApiPropertyOptional({ enum: AdminUserTypeDto })
  @IsEnum(AdminUserTypeDto)
  @IsOptional()
  userType?: AdminUserTypeDto;

  @ApiPropertyOptional({ example: 'student@uce.edu.ec' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'Maria' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({ example: 25, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class AdminUserResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Maria Lopez', required: false, nullable: true })
  fullName?: string | null;

  @ApiProperty({ example: '0102030405', required: false, nullable: true })
  identificationNumber?: string | null;

  @ApiProperty({ example: 'student@uce.edu.ec' })
  email!: string;

  @ApiProperty({ enum: AdminUserStatusDto })
  status!: AdminUserStatusDto;

  @ApiProperty({ enum: AdminUserTypeDto })
  userType!: AdminUserTypeDto;

  @ApiProperty({ example: ['STUDENT'] })
  roles!: string[];

  @ApiProperty({ example: false })
  mfaEnabled!: boolean;

  @ApiProperty({ example: '2026-01-20T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-20T00:00:00Z' })
  updatedAt!: Date;
}

export class AdminUserCreatedResponseDto {
  @ApiProperty({ type: AdminUserResponseDto })
  user!: AdminUserResponseDto;

  @ApiProperty({ example: 'temporary password', required: false, nullable: true })
  temporaryPassword?: string;

  @ApiProperty({ example: 'https://frontend/auth/reset-password?token=...&email=...', required: false, nullable: true })
  resetLink?: string;
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserResponseDto] })
  items!: AdminUserResponseDto[];

  @ApiProperty({ example: 1 })
  total!: number;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: AdminUserStatusDto })
  @IsEnum(AdminUserStatusDto)
  status!: AdminUserStatusDto;
}

export class UpdateUserTypeDto {
  @ApiProperty({ enum: AdminUserTypeDto })
  @IsEnum(AdminUserTypeDto)
  userType!: AdminUserTypeDto;
}

export class UpdateUserProfileDto {
  @ApiProperty({ example: 'student@uce.edu.ec', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Maria Lopez', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: '0102030405', required: false })
  @IsString()
  @IsOptional()
  identificationNumber?: string;
}

export class AdminMessageResponseDto {
  @ApiProperty({ example: 'MFA disabled successfully' })
  message!: string;
}

export class AdminUsersReportDto {
  @ApiProperty({ example: 10 })
  total!: number;

  @ApiProperty({ example: 8 })
  active!: number;

  @ApiProperty({ example: 2 })
  suspended!: number;

  @ApiProperty({
    example: { STUDENT: 6, TEACHER: 3, ADMIN: 1 },
  })
  byType!: Record<string, number>;
}

export class CreateAdminUserDto {
  @ApiProperty({ example: 'docente@correo.com' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'Maria Lopez' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '0102030405', required: false })
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @ApiProperty({ enum: AdminUserTypeDto })
  @IsEnum(AdminUserTypeDto)
  userType!: AdminUserTypeDto;

  @ApiPropertyOptional({ enum: AdminUserStatusDto, default: AdminUserStatusDto.ACTIVE })
  @IsEnum(AdminUserStatusDto)
  @IsOptional()
  status?: AdminUserStatusDto;
}
