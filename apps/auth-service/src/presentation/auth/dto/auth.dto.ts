import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

const INSTITUTIONAL_EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/i;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;
const USER_TYPES = ['TEACHER', 'STUDENT', 'ADMIN'] as const;
type RegisterUserType = (typeof USER_TYPES)[number];


export class LoginRequestDto {
  @ApiProperty({ example: 'student@uce.edu.ec' })
  @IsEmail()
  @Matches(INSTITUTIONAL_EMAIL_REGEX, { message: 'email is invalid' })
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @MinLength(1)
  password!: string;
}

export class RegisterRequestDto {
  @ApiProperty({ example: 'student@uce.edu.ec' })
  @IsEmail()
  @Matches(INSTITUTIONAL_EMAIL_REGEX, { message: 'email is invalid' })
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @Matches(STRONG_PASSWORD_REGEX, {
    message: 'password must be at least 10 chars, include uppercase, lowercase, and number',
  })
  password!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @ApiProperty({ example: 'STUDENT' })
  @IsString()
  @IsNotEmpty()
  @IsIn(USER_TYPES)
  userType!: RegisterUserType;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'student@uce.edu.ec' })
  email!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'STUDENT' })
  userType!: string;
}

export class LoginResponseDto {

  @ApiProperty({ example: false })
  mfaRequired!: boolean;

  @ApiProperty({ example: 'jwt-access-token', required: false })
  accessToken?: string;

  @ApiProperty({ example: 'jwt-refresh-token', required: false })
  refreshToken?: string;

  @ApiProperty({ example: 900, required: false })
  expiresIn?: number;

  @ApiProperty({ example: 'Bearer', required: false })
  tokenType?: string;

  @ApiProperty({ example: 'jwt-mfa-token', required: false })
  mfaToken?: string;

  @ApiProperty({ example: 300, required: false })
  challengeExpiresIn?: number;
}

export class LoginMfaRequestDto {
  @ApiProperty({ example: 'jwt-mfa-token' })
  @IsString()
  mfaToken!: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/)
  code!: string;
}

export class RefreshRequestDto {
  @ApiProperty({ example: 'jwt-refresh-token' })
  @IsString()
  refreshToken!: string;
}

export class RefreshResponseDto {
  @ApiProperty({ example: 'jwt-access-token' })
  accessToken!: string;

  @ApiProperty({ example: 'jwt-refresh-token' })
  refreshToken!: string;

  @ApiProperty({ example: 900 })
  expiresIn!: number;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;
}

export class LogoutRequestDto {
  @ApiProperty({ example: 'jwt-refresh-token' })
  @IsString()
  refreshToken!: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  revokeFamily?: boolean;
}

export class ForgotPasswordRequestDto {
  @ApiProperty({ example: 'student@uce.edu.ec' })
  @IsEmail()
  @Matches(INSTITUTIONAL_EMAIL_REGEX, { message: 'email is invalid' })
  email!: string;
}

export class ResetPasswordRequestDto {
  @ApiProperty({ example: 'reset-token-from-email' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NewStrongPassword123!' })
  @IsString()
  @Matches(STRONG_PASSWORD_REGEX, {
    message: 'password must be at least 10 chars, include uppercase, lowercase, and number',
  })
  newPassword!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Operation completed successfully' })
  message!: string;
}

export class MeResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'student@uce.edu.ec' })
  email!: string;

  @ApiProperty({ example: ['STUDENT'] })
  roles!: string[];

  @ApiProperty({ example: true })
  mfaEnabled!: boolean;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class MfaSetupResponseDto {
  @ApiProperty({ example: 'otpauth-secret' })
  secret!: string;

  @ApiProperty({ example: 'otpauth://totp/UCE%20Auth:student@uce.edu.ec?secret=...' })
  otpauthUrl!: string;

  @ApiProperty({ example: 'data:image/png;base64,...' })
  qrCodeDataUrl!: string;
}

export class MfaVerifyRequestDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class MfaDisableRequestDto {
  @ApiProperty({ example: 'CurrentPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
