# Enrollment Service

## Purpose
Creates enrollments and publishes Kafka events.

## Architecture
- Layered structure: presentation, application, infrastructure, shared.

## Endpoints

### Enrollment Management
- `POST /api/v1/enrollments/assign` - Assign student to course (Teacher only)
- `GET /api/v1/enrollments/students/:studentId` - Get all enrollments for a student (with course details)
- `GET /api/v1/enrollments/courses/:courseId` - Get all enrollments for a course (with student details) (Teacher/Admin only)

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

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
