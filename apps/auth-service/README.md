# Auth Service

## Purpose
IAM service responsible for authentication, token rotation, password recovery, MFA (TOTP), and auth-domain events.

## Endpoints
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/login/mfa`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password/forgot`
- `POST /api/v1/auth/password/reset`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/mfa/setup`
- `POST /api/v1/auth/mfa/verify`
- `POST /api/v1/auth/mfa/disable`
- `GET /health`
- `GET /ready`

## Events Published (Kafka)
- `iam.user.logged_in`
- `iam.user.password_reset_requested`
- `iam.user.password_reset_completed`

## Datastores
- Postgres (Prisma): users, roles, user_roles, refresh_tokens, password_reset_tokens, mfa_secrets, outbox_events
- Redis: rate limiting
- Kafka: auth events

## Run Locally (Node)
1. `cd apps/auth-service`
2. `cp .env.example .env` and update secrets.
3. `npm install`
4. `npm run prisma:migrate`
5. `npm run start:dev`

Swagger: `http://localhost:3001/api/docs`

## Run Locally (Docker Compose)
1. `docker compose -f infra/docker/docker-compose.local.yml up --build`
2. Run migrations from host:
   - `DATABASE_URL=postgresql://edu:edu@localhost:5433/authdb npx prisma migrate deploy --schema prisma/schema.prisma`

## Tests
- Unit: `npm run test:unit`
- E2E: `npm run test:e2e`

## Trade-offs
- Outbox publishing runs as an in-process poller; no separate worker.
- Password reset delivery excludes raw tokens in events; a secure delivery path is required.
