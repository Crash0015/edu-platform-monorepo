import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, Connection, connect } from 'amqplib';


@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private connection?: Connection;
  private channel?: Channel;


  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();

  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publish(queue: string, payload: Record<string, unknown>) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      contentType: 'application/json',
    });
  }

  async consume(queue: string, handler: (payload: Record<string, unknown>) => Promise<void>) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.consume(queue, async (message) => {
      if (!message) {
        return;
      }
      try {
        const payload = JSON.parse(message.content.toString('utf8'));
        await handler(payload);
        this.channel?.ack(message);
      } catch {
        this.channel?.nack(message, false, false);
      }
    });
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(this.channel);
  }
}
