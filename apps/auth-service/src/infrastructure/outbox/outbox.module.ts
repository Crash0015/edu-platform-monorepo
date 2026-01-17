import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OutboxPublisherService } from './outbox.publisher';
import { PrismaOutboxRepository } from '../repositories/outbox.repository';
import { OUTBOX_REPOSITORY } from '../../shared/constants/tokens.constants';

@Module({
  imports: [ConfigModule, KafkaModule, PrismaModule],
  providers: [
    OutboxPublisherService,
    {
      provide: OUTBOX_REPOSITORY,
      useClass: PrismaOutboxRepository,
    },
  ],
  exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
