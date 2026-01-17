import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client?: MqttClient;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('MQTT_URL', 'mqtt://localhost:1883');
    this.client = connect(url);
  }

  async onModuleDestroy() {
    await new Promise<void>((resolve) => {
      if (!this.client) {
        resolve();
        return;
      }
      this.client.end(false, {}, () => resolve());
    });
  }

  async publish(topic: string, payload: Record<string, unknown>) {
    if (!this.client) {
      throw new Error('MQTT client not initialized');
    }
    this.client.publish(topic, JSON.stringify(payload));
  }

  async subscribe(topic: string, handler: (payload: Record<string, unknown>) => void) {
    if (!this.client) {
      throw new Error('MQTT client not initialized');
    }
    this.client.subscribe(topic);
    this.client.on('message', (receivedTopic, message) => {
      if (receivedTopic !== topic) {
        return;
      }
      try {
        const payload = JSON.parse(message.toString('utf8'));
        handler(payload);
      } catch {
        return;
      }
    });
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.client);
  }
}
