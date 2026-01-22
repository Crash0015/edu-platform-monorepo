import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnqueueEmailRequestDto {
  @ApiProperty({ example: 'student@uce.edu.ec' })
  @IsEmail()
  to!: string;

  @ApiProperty({ example: 'Password reset' })
  @IsString()
  @IsNotEmpty()
  subject!: string;

  @ApiProperty({ example: 'Your reset link is ...' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  correlationId!: string;
}

export class CreateNotificationRequestDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'Nueva matricula' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Te matricularon en MAT-101' })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiProperty({ example: { courseId: 'uuid' }, required: false })
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  correlationId!: string;
}

export class NotificationRecordDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  userId!: string;

  @ApiProperty({ example: 'Nueva matricula' })
  title!: string;

  @ApiProperty({ example: 'Te matricularon en MAT-101' })
  body!: string;

  @ApiProperty({ example: false })
  read!: boolean;

  @ApiProperty({ example: '2026-01-20T00:00:00Z' })
  createdAt!: string;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationRecordDto] })
  items!: NotificationRecordDto[];
}

export class EnqueueEmailResponseDto {
  @ApiProperty({ example: 'Notification queued' })
  message!: string;
}
