import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MqttService } from './mqtt.service';
import { AutomationMqttAdapter } from './automation-mqtt.adapter';
import { AutomationSubscriber } from './automation.subscriber';
import { AUTOMATION_MQTT } from '../../application/automation/automation.service';

@Module({
  imports: [ConfigModule],
  providers: [
    MqttService,
    AutomationMqttAdapter,
    AutomationSubscriber,
    {
      provide: AUTOMATION_MQTT,
      useClass: AutomationMqttAdapter,
    },
  ],
  exports: [AUTOMATION_MQTT, MqttService],
})
export class MqttModule {}
