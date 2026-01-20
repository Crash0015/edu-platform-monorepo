# Tutoring Service

## Purpose
Reserves and manages tutoring sessions based on teacher availability.

## Architecture
- Layered structure: presentation, application, domain, infrastructure, shared.
- Proxy pattern for schedule availability validation.

## Endpoints

### Sessions
- `GET /api/v1/tutoring/sessions/available` - List available slots (proxy schedule-service)
- `POST /api/v1/tutoring/sessions/reserve` - Reserve a session (Student/Admin)
- `POST /api/v1/tutoring/sessions/cancel` - Cancel a booking (Student/Admin)
- `GET /api/v1/tutoring/sessions/:id` - Get session details

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

## Events
- `tutoring.session.reserved`

## Datastore
- Postgres via Prisma

## Run Locally
1. `npm install`
2. `npm run prisma:migrate`
3. `npm run start:dev`

## Tests
- `npm run test:unit`

## Trade-offs
- Kafka events are published directly without an outbox worker.
