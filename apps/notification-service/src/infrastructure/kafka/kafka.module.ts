import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnrollmentKafkaConsumer } from './kafka.consumer';

@Module({
  imports: [ConfigModule],
  providers: [EnrollmentKafkaConsumer],
  exports: [EnrollmentKafkaConsumer],
})
export class KafkaModule {}
