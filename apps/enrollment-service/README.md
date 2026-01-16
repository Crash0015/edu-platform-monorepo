# Enrollment Service

## Purpose
Creates enrollments and publishes Kafka events.

## Architecture
- Layered structure: presentation, application, infrastructure, shared.

## Endpoints
- `POST /api/v1/enrollments`
- `GET /health`
- `GET /ready`

## Events
- `enrollment.enrollment.created`

## Run Locally
1. `npm install`
2. `npm run prisma:migrate`
3. `npm run start:dev`

## Tests
- `npm run test:unit`

## Trade-offs
- Kafka events are published directly without an outbox worker.
