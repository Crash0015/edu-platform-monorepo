# Enrollment Service Security

## Controls
- JWT validation and RBAC enforced at gateway/service.
- DTO validation for enrollment requests.
- No sensitive data in Kafka events.

## Secrets
- `DATABASE_URL` for Postgres.
- `KAFKA_BROKERS` for Kafka connection.
