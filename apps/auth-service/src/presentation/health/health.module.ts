import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, RedisModule, KafkaModule],
  controllers: [HealthController],
})
export class HealthModule {}
