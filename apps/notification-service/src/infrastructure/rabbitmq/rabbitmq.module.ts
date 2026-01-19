import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqService } from './rabbitmq.service';
import { RabbitMqNotificationQueue } from './notification-queue.adapter';
import { NOTIFICATION_QUEUE } from '../../application/notifications/notification.service';

@Module({
  imports: [ConfigModule],
  providers: [
    RabbitMqService,
    RabbitMqNotificationQueue,
    {
      provide: NOTIFICATION_QUEUE,
      useClass: RabbitMqNotificationQueue,
    },
  ],
  exports: [NOTIFICATION_QUEUE, RabbitMqService],

})
export class RabbitMqModule {}
