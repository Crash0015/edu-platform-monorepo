import { Injectable } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Injectable()
export class KafkaProducer {
  constructor(private readonly kafkaService: KafkaService) {}

  async emit(eventType: string, payload: Record<string, unknown>) {
    await this.kafkaService.emit(eventType, payload);
  }
}
