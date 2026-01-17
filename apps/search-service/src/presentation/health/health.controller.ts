import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MongoService } from '../../infrastructure/mongo/mongo.service';
import { KafkaConsumerService } from '../../infrastructure/kafka/kafka.consumer';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly mongoService: MongoService,
    private readonly kafkaConsumerService: KafkaConsumerService,
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
    const mongo = await this.mongoService.healthCheck();
    const kafka = await this.kafkaConsumerService.healthCheck();
    if (!mongo || !kafka) {
      throw new ServiceUnavailableException({
        message: 'Dependencies are not ready',
        details: { mongo, kafka },
      });
    }
    return { status: 'ready', dependencies: { mongo, kafka } };
  }
}
