# Material Service Security

## Controls
- JWT + RBAC enforced for all write operations.
- DTO validation and payload size limits.
- Do not expose Strapi admin endpoints.
- No sensitive data in events.

## Secrets
- STRAPI_URL
- STRAPI_API_TOKEN
- KAFKA_BROKERS
