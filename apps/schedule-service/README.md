# Schedule Service

## Purpose
Manages teacher availability slots and prevents schedule conflicts.

## Architecture
- Hexagonal structure: presentation, application, domain, infrastructure, shared.
- Singleton configuration access via `ScheduleConfig`.

## Endpoints

### Availability
- `POST /api/v1/schedule/availability` - Create availability slot (Teacher/Admin)
- `GET /api/v1/schedule/availability/teacher/:teacherId` - List availability by teacher
- `DELETE /api/v1/schedule/availability/:id` - Remove availability slot (Teacher/Admin)

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

## Events
- `tutoring.availability.created`

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
