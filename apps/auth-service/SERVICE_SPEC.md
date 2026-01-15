# Auth Service Specification

## Scope
Implements authentication, refresh token rotation, password reset flow, MFA (TOTP), and auth-domain events.

## API
See `docs/api/auth.md` for the full REST contract, validation rules, and event catalog alignment.

## Persistence
- Postgres via Prisma (system of record)
- Redis for rate limiting
- Kafka for event publishing (outbox pattern)

## Security
- JWT access + refresh rotation
- Institutional email validation (`@uce.edu.ec`)
- Hashed password and token storage
- Redis-backed rate limiting
