import { Module } from '@nestjs/common';
import { AutomationController } from './automation.controller';
import { AutomationService } from '../../application/automation/automation.service';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { MqttModule } from '../../infrastructure/mqtt/mqtt.module';
import { AutomationConsumer } from '../../infrastructure/rabbitmq/automation.consumer';

@Module({
  imports: [RabbitMqModule, MqttModule],
  controllers: [AutomationController],
  providers: [AutomationService, AutomationConsumer],
})
export class AutomationModule {}
