import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum AvailabilityStatusDto {
  AVAILABLE = 'AVAILABLE',
  BLOCKED = 'BLOCKED',
}

export class CreateAvailabilityRequestDto {
  @ApiProperty({ example: 'uuid', description: 'Teacher user ID' })
  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ example: 'uuid', description: 'Optional course ID', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ example: '2026-01-20T10:00:00Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-01-20T11:00:00Z' })
  @IsDateString()
  endTime!: string;

  @ApiProperty({ example: 'America/Guayaquil' })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiProperty({ enum: AvailabilityStatusDto, required: false, default: AvailabilityStatusDto.AVAILABLE })
  @IsEnum(AvailabilityStatusDto)
  @IsOptional()
  status?: AvailabilityStatusDto;
}

export class AvailabilityQueryDto {
  @ApiProperty({ example: '2026-01-20T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startTimeFrom?: string;

  @ApiProperty({ example: '2026-01-25T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  startTimeTo?: string;

  @ApiProperty({ enum: AvailabilityStatusDto, required: false })
  @IsEnum(AvailabilityStatusDto)
  @IsOptional()
  status?: AvailabilityStatusDto;
}

export class UpdateAvailabilityStatusRequestDto {
  @ApiProperty({ enum: AvailabilityStatusDto })
  @IsEnum(AvailabilityStatusDto)
  status!: AvailabilityStatusDto;
}

export class UpdateAvailabilityRequestDto {
  @ApiProperty({ example: 'uuid', description: 'Optional course ID', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ example: '2026-01-20T10:00:00Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-01-20T11:00:00Z' })
  @IsDateString()
  endTime!: string;

  @ApiProperty({ example: 'America/Guayaquil' })
  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @ApiProperty({ enum: AvailabilityStatusDto })
  @IsEnum(AvailabilityStatusDto)
  status!: AvailabilityStatusDto;
}

export class AvailabilityResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  teacherId!: string;

  @ApiProperty({ example: 'uuid', required: false, nullable: true })
  courseId!: string | null;

  @ApiProperty({ example: '2026-01-20T10:00:00Z' })
  startTime!: Date;

  @ApiProperty({ example: '2026-01-20T11:00:00Z' })
  endTime!: Date;

  @ApiProperty({ example: 'America/Guayaquil' })
  timezone!: string;

  @ApiProperty({ enum: AvailabilityStatusDto })
  status!: AvailabilityStatusDto;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  updatedAt!: Date;
}
