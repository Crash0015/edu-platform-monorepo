import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RabbitMqService } from '../../infrastructure/rabbitmq/rabbitmq.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  @Get('health')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  async health() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    const rabbitmq = await this.rabbitMqService.healthCheck();
    if (!rabbitmq) {
      throw new ServiceUnavailableException({
        message: 'Dependencies are not ready',
        details: { rabbitmq },
      });
    }
    return { status: 'ready', dependencies: { rabbitmq } };
  }
}
