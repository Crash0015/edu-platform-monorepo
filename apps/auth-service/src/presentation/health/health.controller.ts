import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly kafkaService: KafkaService,
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
    const dependencies = {
      database: false,
      redis: false,
      kafka: false,
    };

    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      dependencies.database = true;
    } catch {
      dependencies.database = false;
    }

    try {
      await this.redisService.ping();
      dependencies.redis = true;
    } catch {
      dependencies.redis = false;
    }

    dependencies.kafka = await this.kafkaService.healthCheck();

    const ready = dependencies.database && dependencies.redis && dependencies.kafka;
    if (!ready) {
      throw new ServiceUnavailableException({
        message: 'Dependencies are not ready',
        details: dependencies,
      });
    }

    return { status: 'ready', dependencies };
  }
}
