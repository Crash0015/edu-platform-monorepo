import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class AutomationQueueRequestDto {
  @ApiProperty({ example: 'demo' })
  @IsString()
  @IsNotEmpty()
  jobType!: string;

  @ApiProperty({ example: { message: 'hello' } })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  correlationId!: string;
}

export class AutomationPublishRequestDto {
  @ApiProperty({ example: 'automation.demo' })
  @IsString()
  @IsNotEmpty()
  eventType!: string;

  @ApiProperty({ example: { message: 'hello' } })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  correlationId!: string;
}

export class AutomationMessageResponseDto {
  @ApiProperty({ example: 'Queued' })
  message!: string;
}
