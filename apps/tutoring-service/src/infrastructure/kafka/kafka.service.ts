import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Admin } from 'kafkajs';
import { TutoringConfig } from '../../shared/config/tutoring-config';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly enabled: boolean;
  private readonly kafka: Kafka | null;
  private producer: Producer | null = null;
  private admin: Admin | null = null;

  constructor(private readonly configService: ConfigService) {
    const config = TutoringConfig.getInstance(configService);
    this.enabled = config.kafkaEnabled;

    if (this.enabled && config.kafkaBrokers.length > 0) {
      this.kafka = new Kafka({
        clientId: config.kafkaClientId,
        brokers: config.kafkaBrokers,
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
    const sendPromise = this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });

    await Promise.race([
      sendPromise,
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]).catch(() => undefined);
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
