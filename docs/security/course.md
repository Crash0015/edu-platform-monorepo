# Course Service Security

## Controls
- JWT + RBAC enforced for mutations.
- DTO validation for all inputs.
- No sensitive data in Kafka events.
- Read endpoints may be cached or public only if allowed by gateway.

## Secrets
- DATABASE_URL
- MONGO_URL
- KAFKA_BROKERS
