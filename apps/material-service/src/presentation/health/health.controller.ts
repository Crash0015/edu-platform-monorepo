import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  health() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    const kafka = await this.kafkaService.healthCheck();
    return { status: kafka ? 'ready' : 'degraded', dependencies: { kafka } };
  }
}
