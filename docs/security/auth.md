# Auth Service Security

## Controls
- Institutional email enforcement (@uce.edu.ec) for login and password flows.
- Passwords, refresh tokens, and reset tokens stored hashed only.
- Refresh token rotation with reuse detection and family revocation.
- MFA TOTP secrets encrypted at rest and never logged.
- Rate limiting on login, refresh, and password endpoints.
- JWT validation and RBAC for protected endpoints.
- Structured logs include correlationId and actorUserId.
- Kafka events exclude secrets and tokens.

## Secrets
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- TOKEN_HASH_SECRET
- MFA_CHALLENGE_SECRET
- MFA_ENCRYPTION_KEY
- DATABASE_URL
- REDIS_URL
- KAFKA_BROKERS
- GRPC_PORT
