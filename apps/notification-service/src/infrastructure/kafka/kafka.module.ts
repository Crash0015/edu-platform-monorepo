import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentKafkaConsumer } from './kafka.consumer';
import { NotificationModule } from '../../presentation/notifications/notification.module';

@Module({
  imports: [ConfigModule, forwardRef(() => NotificationModule)],
  providers: [EnrollmentKafkaConsumer],
  exports: [EnrollmentKafkaConsumer],
})
export class KafkaModule {}
