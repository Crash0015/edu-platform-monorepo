import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMqService } from './rabbitmq.service';
import { NotificationService } from '../../application/notifications/notification.service';

const EMAIL_QUEUE = 'notifications.email';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    await this.rabbitMqService.consume(EMAIL_QUEUE, async (payload) => {
      await this.notificationService.handleEmail(payload as any);
    });
  }
}
