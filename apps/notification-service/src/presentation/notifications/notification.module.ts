import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from '../../application/notifications/notification.service';
import { RabbitMqModule } from '../../infrastructure/rabbitmq/rabbitmq.module';
import { NotificationConsumer } from '../../infrastructure/rabbitmq/notification.consumer';
import { EnrollmentKafkaConsumer } from '../../infrastructure/kafka/kafka.consumer';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';

@Module({
  imports: [ConfigModule, RabbitMqModule, forwardRef(() => KafkaModule)],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationConsumer],
  exports: [NotificationService],
})
export class NotificationModule {}


