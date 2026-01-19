import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '../../application/notifications/notification.service';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { NotificationConsumer } from '../../infrastructure/rabbitmq/notification.consumer';
import { EnrollmentKafkaConsumer } from '../../infrastructure/kafka/kafka.consumer';

@Module({
  imports: [ConfigModule, RabbitMqModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationConsumer, EnrollmentKafkaConsumer],
})
export class NotificationModule {}


