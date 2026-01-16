import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RabbitMqService } from '../../infrastructure/rabbitmq/rabbitmq.service';
import { MqttService } from '../../infrastructure/mqtt/mqtt.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly mqttService: MqttService,
  ) {}

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
    const mqtt = await this.mqttService.healthCheck();
    if (!rabbitmq || !mqtt) {
      throw new ServiceUnavailableException({
        message: 'Dependencies are not ready',
        details: { rabbitmq, mqtt },
      });
    }
    return { status: 'ready', dependencies: { rabbitmq, mqtt } };
  }
}
