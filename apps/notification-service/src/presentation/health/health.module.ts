import { Module } from '@nestjs/common';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { HealthController } from './health.controller';

@Module({
  imports: [RabbitMqModule],
  controllers: [HealthController],
})
export class HealthModule {}
