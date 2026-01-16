import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MqttService } from './mqtt.service';

const MQTT_TOPIC = 'edu/automation/events';

@Injectable()
export class AutomationSubscriber implements OnModuleInit {
  private readonly logger = new Logger(AutomationSubscriber.name);

  constructor(private readonly mqttService: MqttService) {}

  async onModuleInit() {
    await this.mqttService.subscribe(MQTT_TOPIC, (payload) => {
      this.logger.log(`Received MQTT event on ${MQTT_TOPIC}`);
      this.logger.debug(JSON.stringify(payload));
    });
  }
}
