import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationPayload, NotificationQueue } from './ports/notification.queue';

export const NOTIFICATION_QUEUE = Symbol('NOTIFICATION_QUEUE');

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_QUEUE)
    private readonly queue: NotificationQueue,
  ) {}

  async enqueueEmail(payload: NotificationPayload) {
    await this.queue.enqueueEmail(payload);
    return { message: 'Notification queued' };
  }

  async handleEmail(payload: NotificationPayload) {
    this.logger.log(`Sending email to ${payload.to} (${payload.correlationId})`);
  }
}
