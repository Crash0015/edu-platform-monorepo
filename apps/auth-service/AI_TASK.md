# AUTH-SERVICE TASK

Implement auth-service based on AI_CONTEXT.md and docs.

Must include:

- PostgreSQL persistence for users + password_reset_tokens + refresh_tokens (hashed)
- JWT access + refresh
- RBAC guard + decorator
- Swagger with auth endpoints
- Kafka publisher for: USER_LOGGED_IN, USER_PASSWORD_RESET_REQUESTED, USER_CREATED (if auth creates users) using the standard event envelope
- Health endpoint (/health)
- Dockerfile + local compose compatibility

Tech constraints:

- NestJS + TypeScript
- No hardcoded users
- Config via env vars
