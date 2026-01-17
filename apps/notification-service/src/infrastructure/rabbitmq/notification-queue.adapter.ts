import { Injectable } from '@nestjs/common';
import { NotificationPayload, NotificationQueue } from '../../application/notifications/ports/notification.queue';
import { RabbitMqService } from './rabbitmq.service';

const EMAIL_QUEUE = 'notifications.email';

@Injectable()
export class RabbitMqNotificationQueue implements NotificationQueue {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  async enqueueEmail(payload: NotificationPayload): Promise<void> {
    await this.rabbitMqService.publish(EMAIL_QUEUE, payload);
  }
}
