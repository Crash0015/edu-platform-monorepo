import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { OutboxPublisherService } from './outbox.publisher';
import { PrismaOutboxRepository } from '../repositories/outbox.repository';
import { OUTBOX_REPOSITORY } from '../../shared/constants/tokens.constants';

@Module({
  imports: [ConfigModule, KafkaModule, PrismaModule],
  providers: [
    OutboxPublisherService,
    {
      provide: OUTBOX_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOutboxRepository(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [OUTBOX_REPOSITORY],
})
export class OutboxModule {}
