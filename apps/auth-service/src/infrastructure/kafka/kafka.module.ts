import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { KafkaProducer } from './kafka-producer.service';

@Module({
  imports: [ConfigModule],
  providers: [KafkaService, KafkaProducer],
  exports: [KafkaService, KafkaProducer],
})

export class KafkaModule {}
