import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Admin } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly enabled: boolean;
  private readonly kafka: Kafka | null;
  private producer: Producer | null = null;
  private admin: Admin | null = null;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService.get<string>('KAFKA_BROKERS', '');
    const brokerList = brokers.split(',').map((broker) => broker.trim()).filter(Boolean);
    this.enabled = this.configService.get<string>('KAFKA_ENABLED', 'true') !== 'false';

    if (this.enabled && brokerList.length > 0) {
      this.kafka = new Kafka({
        clientId: this.configService.get<string>('KAFKA_CLIENT_ID', 'course-service'),
        brokers: brokerList,
      });
    } else {
      this.kafka = null;
    }
  }

  async onModuleInit() {
    if (!this.kafka) {
      return;
    }
    this.producer = this.kafka.producer();
    this.admin = this.kafka.admin();
    await this.producer.connect();
    await this.admin.connect();
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.admin) {
      await this.admin.disconnect();
    }
  }

  async emit(topic: string, payload: object) {
    if (!this.producer) {
      return;
    }
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });
  }

  async healthCheck(): Promise<boolean> {
    if (!this.admin) {
      return !this.enabled;
    }
    try {
      await this.admin.fetchTopicMetadata({ topics: [] });
      return true;
    } catch {
      return false;
    }
  }
}
