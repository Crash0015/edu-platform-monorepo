import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEnrollmentRequestDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  correlationId!: string;
}

export class EnrollmentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  studentId!: string;

  @ApiProperty({ example: 'uuid' })
  courseId!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}
