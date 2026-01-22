import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  correlationId?: string;
}

export class CreateEnrollmentWithProfileRequestDto {
  @ApiProperty({ example: 'student@uce.edu.ec' })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({ example: '0102030405', required: false })
  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsOptional()
  correlationId?: string;
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

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  enrolledAt!: Date;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  updatedAt!: Date;
}

export class CourseDetailDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'MAT-101' })
  code!: string;

  @ApiProperty({ example: 'Matemáticas Básicas' })
  name!: string;

  @ApiProperty({ example: 'Curso introductorio', required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ example: 30 })
  capacity!: number;

  @ApiProperty({ example: 10 })
  seatsTaken!: number;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;
}

export class StudentDetailDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'student@uce.edu.ec' })
  email!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: 'STUDENT' })
  userType!: string;
}

export class EnrollmentWithCourseDto extends EnrollmentResponseDto {
  @ApiProperty({ type: CourseDetailDto, nullable: true })
  course!: CourseDetailDto | null;
}

export class EnrollmentWithStudentDto extends EnrollmentResponseDto {
  @ApiProperty({ type: StudentDetailDto, nullable: true })
  student!: StudentDetailDto | null;
}

export class EnrollmentAdminDto extends EnrollmentResponseDto {
  @ApiProperty({ type: CourseDetailDto, required: false, nullable: true })
  course?: CourseDetailDto | null;

  @ApiProperty({ type: StudentDetailDto, required: false, nullable: true })
  student?: StudentDetailDto | null;
}
