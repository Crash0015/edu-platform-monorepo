import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsEnum, IsUUID } from 'class-validator';

export enum CourseStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum TeacherRoleDto {
  OWNER = 'OWNER',
  ASSISTANT = 'ASSISTANT',
}

export class CreateCourseRequestDto {
  @ApiProperty({ example: 'MAT-101', description: 'Unique course code' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Matemáticas Básicas', description: 'Course name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Curso introductorio de matemáticas', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'uuid', required: false, description: 'Academic period ID' })
  @IsUUID()
  @IsOptional()
  periodId?: string;

  @ApiProperty({ example: 30, required: false, default: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}

export class UpdateCourseRequestDto {
  @ApiProperty({ example: 'Matemáticas Avanzadas', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Curso avanzado de matemáticas', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CourseStatusDto, required: false })
  @IsEnum(CourseStatusDto)
  @IsOptional()
  status?: CourseStatusDto;

  @ApiProperty({ example: 40, required: false })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}

export class CourseResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'MAT-101' })
  code!: string;

  @ApiProperty({ example: 'Matemáticas Básicas' })
  name!: string;

  @ApiProperty({ example: 'Curso introductorio', required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'uuid', required: false, nullable: true })
  periodId!: string | null;

  @ApiProperty({ enum: CourseStatusDto })
  status!: CourseStatusDto;

  @ApiProperty({ example: 30 })
  capacity!: number;

  @ApiProperty({ example: 10 })
  seatsTaken!: number;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  updatedAt!: Date;
}

export class AssignTeacherRequestDto {
  @ApiProperty({ example: 'uuid', description: 'Teacher user ID' })
  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ example: 'uuid', description: 'Course ID' })
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty({ enum: TeacherRoleDto, required: false, default: 'OWNER' })
  @IsEnum(TeacherRoleDto)
  @IsOptional()
  roleInCourse?: TeacherRoleDto;
}

export class TeacherCourseResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'uuid' })
  teacherId!: string;

  @ApiProperty({ example: 'uuid' })
  courseId!: string;

  @ApiProperty({ enum: TeacherRoleDto })
  roleInCourse!: TeacherRoleDto;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-12T00:00:00Z' })
  updatedAt!: Date;
}

export class ListCoursesQueryDto {
  @ApiProperty({ enum: CourseStatusDto, required: false })
  @IsEnum(CourseStatusDto)
  @IsOptional()
  status?: CourseStatusDto;

  @ApiProperty({ example: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  periodId?: string;
}
