import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

export class EnqueueEmailResponseDto {
  @ApiProperty({ example: 'Notification queued' })
  message!: string;
}
