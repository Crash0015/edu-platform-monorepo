# Search Service Security

## Controls
- Read-only endpoints; no sensitive data stored.
- JWT/RBAC enforced at gateway.
- Consumer handles idempotency for at-least-once events.

## Secrets
- `MONGO_URL` for projection storage.
- `KAFKA_BROKERS` for event consumption.
