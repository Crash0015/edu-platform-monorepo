import { randomUUID } from 'crypto';
import { EVENT_PRODUCER, EVENT_VERSION } from '../../shared/constants/events.constants';

export type EventEnvelope = {
  event_id: string;
  event_type: string;
  event_version: number;
  occurred_at: string;
  producer: string;
  correlation_id: string;
  actor_user_id: string | null;
  payload: Record<string, unknown>;
};

export const buildEventEnvelope = (input: {
  eventType: string;
  correlationId: string;
  actorUserId: string | null;
  payload: Record<string, unknown>;
}): EventEnvelope => ({
  event_id: randomUUID(),
  event_type: input.eventType,
  event_version: EVENT_VERSION,
  occurred_at: new Date().toISOString(),
  producer: EVENT_PRODUCER,
  correlation_id: input.correlationId,
  actor_user_id: input.actorUserId,
  payload: input.payload,
});
