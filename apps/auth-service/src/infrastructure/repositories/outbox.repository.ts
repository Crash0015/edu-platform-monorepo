import { Inject, Injectable } from '@nestjs/common';
import { OutboxRepository, OutboxEventInput } from '../../application/auth/ports/auth.repositories';
import { PrismaClientLike } from './prisma.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaOutboxRepository implements OutboxRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClientLike) {}

  async enqueue(event: OutboxEventInput): Promise<void> {
    await this.prisma.outboxEvent.create({
      data: {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        eventVersion: event.eventVersion,
        payload: event.payload,
        status: 'PENDING',
      },
    });
  }

  async fetchPending(limit: number) {
    const events = await this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      payload: event.payload as Record<string, unknown>,
      attempts: event.attempts,
    }));
  }

  async markSent(id: string, sentAt: Date): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt,
      },
    });
  }

  async markFailed(id: string, attempts: number, lastError: string, status: 'FAILED' | 'PENDING'): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        attempts,
        lastError,
        status,
      },
    });
  }
}
