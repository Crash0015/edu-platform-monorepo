import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConsumerService } from './kafka.consumer';

@Module({
  imports: [ConfigModule],
  providers: [KafkaConsumerService],
})
export class KafkaModule {}
