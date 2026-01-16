import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from '../../application/notifications/notification.service';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { NotificationConsumer } from '../../infrastructure/rabbitmq/notification.consumer';

@Module({
  imports: [RabbitMqModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationConsumer],
})
export class NotificationModule {}
