import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, KafkaModule],
  controllers: [HealthController],
})
export class HealthModule {}
