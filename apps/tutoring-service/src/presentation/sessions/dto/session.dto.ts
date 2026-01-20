import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum TutoringModeDto {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
}

export enum SessionStatusDto {
  OPEN = 'OPEN',
  RESERVED = 'RESERVED',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE',
}

export enum BookingStatusDto {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export class AvailableSessionsQueryDto {
  @ApiProperty({ example: 'uuid', description: 'Teacher user ID' })
  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ example: '2026-01-20T00:00:00Z', required: false })
  @IsString()
  @IsOptional()
  startTimeFrom?: string;

  @ApiProperty({ example: '2026-01-25T00:00:00Z', required: false })
  @IsString()
  @IsOptional()
  startTimeTo?: string;
}

export class AvailableSessionResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  teacherId!: string;

  @ApiProperty({ example: 'uuid', required: false, nullable: true })
  courseId!: string | null;

  @ApiProperty({ example: '2026-01-20T10:00:00Z' })
  startTime!: string;

  @ApiProperty({ example: '2026-01-20T11:00:00Z' })
  endTime!: string;

  @ApiProperty({ example: 'America/Guayaquil' })
  timezone!: string;
}

export class ReserveSessionRequestDto {
  @ApiProperty({ example: 'uuid', description: 'Availability slot ID' })
  @IsUUID()
  @IsNotEmpty()
  availabilitySlotId!: string;

  @ApiProperty({ example: 'uuid', description: 'Teacher user ID' })
  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ example: 'uuid', description: 'Student user ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'uuid', description: 'Course ID' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ enum: TutoringModeDto })
  @IsEnum(TutoringModeDto)
  mode!: TutoringModeDto;

  @ApiProperty({ example: 'Zoom', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'https://meet.example.com/room', required: false })
  @IsString()
  @IsOptional()
  meetingUrl?: string;
}

export class CancelSessionRequestDto {
  @ApiProperty({ example: 'uuid', description: 'Booking ID' })
  @IsUUID()
  @IsNotEmpty()
  bookingId!: string;
}

export class BookingResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  tutoringSessionId!: string;

  @ApiProperty({ example: 'uuid' })
  studentId!: string;

  @ApiProperty({ enum: BookingStatusDto })
  status!: BookingStatusDto;

  @ApiProperty({ example: '2026-01-20T10:00:00Z' })
  reservedAt!: Date;
}

export class SessionResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  teacherId!: string;

  @ApiProperty({ example: 'uuid' })
  courseId!: string;

  @ApiProperty({ example: 'uuid' })
  availabilitySlotId!: string;

  @ApiProperty({ example: '2026-01-20T10:00:00Z' })
  startTime!: Date;

  @ApiProperty({ example: '2026-01-20T11:00:00Z' })
  endTime!: Date;

  @ApiProperty({ enum: TutoringModeDto })
  mode!: TutoringModeDto;

  @ApiProperty({ example: 'Zoom', required: false, nullable: true })
  location!: string | null;

  @ApiProperty({ example: 'https://meet.example.com/room', required: false, nullable: true })
  meetingUrl!: string | null;

  @ApiProperty({ enum: SessionStatusDto })
  status!: SessionStatusDto;

  @ApiProperty({ required: false, type: BookingResponseDto, nullable: true })
  booking!: BookingResponseDto | null;
}
