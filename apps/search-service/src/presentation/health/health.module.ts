import { Module } from '@nestjs/common';
import { MongoModule } from '../../infrastructure/mongo/mongo.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { HealthController } from './health.controller';

@Module({
  imports: [MongoModule, KafkaModule],
  controllers: [HealthController],
})
export class HealthModule {}
