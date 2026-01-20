import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaConsumerService } from './kafka.consumer';
import { SearchModule } from '../../presentation/search/search.module';

@Module({
  imports: [ConfigModule, SearchModule],
  providers: [KafkaConsumerService],
  exports: [KafkaConsumerService],
})
export class KafkaModule {}
