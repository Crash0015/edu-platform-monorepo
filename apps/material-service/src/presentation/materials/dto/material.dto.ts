import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, MaxLength, Min } from 'class-validator';

export enum MaterialTypeDto {
  PDF = 'PDF',
  LINK = 'LINK',
  VIDEO = 'VIDEO',
}

export enum MaterialStatusDto {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateMaterialRequestDto {
  @ApiProperty({ example: 'Algebra week 1' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Introductory material', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'uuid', description: 'Course ID' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ enum: MaterialTypeDto })
  @IsEnum(MaterialTypeDto)
  type!: MaterialTypeDto;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  @IsUrl()
  resourceUrl!: string;

  @ApiProperty({ example: 'https://example.com/cover.png', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 45, required: false })
  @Min(1)
  @IsOptional()
  durationMinutes?: number;
}

export class UpdateMaterialRequestDto {
  @ApiProperty({ example: 'Algebra week 1', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @ApiProperty({ example: 'Introductory material', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @ApiProperty({ enum: MaterialTypeDto, required: false })
  @IsEnum(MaterialTypeDto)
  @IsOptional()
  type?: MaterialTypeDto;

  @ApiProperty({ example: 'https://example.com/file.pdf', required: false })
  @IsUrl()
  @IsOptional()
  resourceUrl?: string;

  @ApiProperty({ example: 'https://example.com/cover.png', required: false })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string | null;

  @ApiProperty({ example: 45, required: false })
  @Min(1)
  @IsOptional()
  durationMinutes?: number | null;

  @ApiProperty({ enum: MaterialStatusDto, required: false })
  @IsEnum(MaterialStatusDto)
  @IsOptional()
  status?: MaterialStatusDto;
}

export class MaterialsQueryDto {
  @ApiProperty({ example: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ enum: MaterialStatusDto, required: false })
  @IsEnum(MaterialStatusDto)
  @IsOptional()
  status?: MaterialStatusDto;

  @ApiProperty({ enum: MaterialTypeDto, required: false })
  @IsEnum(MaterialTypeDto)
  @IsOptional()
  type?: MaterialTypeDto;
}

export class MaterialResponseDto {
  @ApiProperty({ example: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Algebra week 1' })
  title!: string;

  @ApiProperty({ example: 'Introductory material', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 'uuid' })
  courseId!: string;

  @ApiProperty({ enum: MaterialTypeDto })
  type!: MaterialTypeDto;

  @ApiProperty({ enum: MaterialStatusDto })
  status!: MaterialStatusDto;

  @ApiProperty({ example: 'https://example.com/file.pdf' })
  resourceUrl!: string;

  @ApiProperty({ example: 'https://example.com/cover.png', nullable: true })
  thumbnailUrl!: string | null;

  @ApiProperty({ example: 45, nullable: true })
  durationMinutes!: number | null;

  @ApiProperty({ example: '2026-01-12T00:00:00Z', nullable: true })
  publishedAt!: string | null;
}
