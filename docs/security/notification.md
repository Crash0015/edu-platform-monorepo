# Notification Service Security

## Controls
- Validate input DTOs and sanitize message content.
- Do not log sensitive payloads.
- Enforce authentication on REST endpoints when integrated behind API Gateway.
- Rate limiting at gateway level for enqueue endpoint.

## Secrets
- `RABBITMQ_URL` or host/port/user/pass from environment.
