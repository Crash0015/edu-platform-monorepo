import { Injectable } from '@nestjs/common';
import { AutomationMessage, AutomationMqtt } from '../../application/automation/ports/automation.messaging';
import { MqttService } from './mqtt.service';

const MQTT_TOPIC = 'edu/automation/events';

@Injectable()
export class AutomationMqttAdapter implements AutomationMqtt {
  constructor(private readonly mqttService: MqttService) {}

  async publishEvent(message: AutomationMessage): Promise<void> {
    await this.mqttService.publish(MQTT_TOPIC, message);
  }
}
