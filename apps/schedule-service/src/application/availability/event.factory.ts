import { EVENT_PRODUCER, EVENT_VERSION } from '../../shared/constants/events.constants';

export interface EventEnvelope {
  event_id: string;
  event_type: string;
  event_version: number;
  occurred_at: string;
  producer: string;
  correlation_id: string;
  actor_user_id: string | null;
  payload: Record<string, unknown>;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function buildEventEnvelope(input: {
  eventType: string;
  correlationId: string;
  actorUserId?: string | null;
  payload: Record<string, unknown>;
}): EventEnvelope {
  return {
    event_id: generateUUID(),
    event_type: input.eventType,
    event_version: EVENT_VERSION,
    occurred_at: new Date().toISOString(),
    producer: EVENT_PRODUCER,
    correlation_id: input.correlationId,
    actor_user_id: input.actorUserId || null,
    payload: input.payload,
  };
}
