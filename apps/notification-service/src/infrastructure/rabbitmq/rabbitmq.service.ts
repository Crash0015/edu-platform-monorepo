import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
    this.connection = await this.connectWithRetry(url);
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

  private async connectWithRetry(url: string, attempts = 8, delayMs = 1500): Promise<amqp.ChannelModel> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const connection = (await amqp.connect(url)) as amqp.ChannelModel;
        this.logger.log('RabbitMQ connection established');
        return connection;
      } catch (error) {
        lastError = error;
        this.logger.warn(`RabbitMQ connection failed (attempt ${attempt}/${attempts})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
  }
}
