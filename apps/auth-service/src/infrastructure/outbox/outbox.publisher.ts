import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { OutboxRepository } from '../../application/auth/ports/auth.repositories';
import { KafkaProducer } from '../kafka/kafka-producer.service';
import { OUTBOX_REPOSITORY } from '../../shared/constants/tokens.constants';


@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private readonly batchSize: number;
  private readonly maxAttempts: number;

  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: OutboxRepository,
    private readonly kafkaProducer: KafkaProducer,
    private readonly configService: ConfigService,
  ) {

    this.batchSize = Number(this.configService.get<number>('OUTBOX_BATCH_SIZE', 20));
    this.maxAttempts = Number(this.configService.get<number>('OUTBOX_MAX_ATTEMPTS', 5));
  }

  @Interval(5000)
  async publishPending() {
    const events = await this.outboxRepository.fetchPending(this.batchSize);
    if (events.length === 0) {
      return;
    }

    for (const event of events) {
      try {
        await this.kafkaProducer.emit(event.eventType, event.payload);

        await this.outboxRepository.markSent(event.id, new Date());
      } catch (error) {
        const attempts = event.attempts + 1;
        const status = attempts >= this.maxAttempts ? 'FAILED' : 'PENDING';
        await this.outboxRepository.markFailed(
          event.id,
          attempts,
          error instanceof Error ? error.message : 'Unknown error',
          status,
        );
        this.logger.warn(`Failed to publish outbox event ${event.id} (attempt ${attempts})`);
      }
    }
  }
}
