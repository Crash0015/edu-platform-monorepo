import { Module } from '@nestjs/common';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { MqttModule } from '../../infrastructure/mqtt/mqtt.module';
import { HealthController } from './health.controller';

@Module({
  imports: [RabbitMqModule, MqttModule],
  controllers: [HealthController],
})
export class HealthModule {}
