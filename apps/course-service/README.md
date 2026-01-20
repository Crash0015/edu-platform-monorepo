# Course Service

## Purpose

Academic Management service responsible for managing courses, teacher assignments, and course metadata.

## Architecture

- Layered: `presentation/`, `application/`, `infrastructure/`, `shared/`
- Repository pattern for data access
- Event-driven integration via Kafka

## Endpoints

### Courses
- `POST /api/v1/courses` - Create course (Teacher/Admin)
- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `GET /api/v1/courses/code/:code` - Get course by code
- `GET /api/v1/courses/teachers/:teacherId` - Get courses by teacher
- `PATCH /api/v1/courses/:id` - Update course (Teacher/Admin)
- `DELETE /api/v1/courses/:id` - Delete course (Teacher/Admin)

### Teacher Assignments
- `POST /api/v1/courses/teachers/assign` - Assign teacher to course
- `GET /api/v1/courses/:id/teachers` - Get teachers assigned to course
- `DELETE /api/v1/courses/:courseId/teachers/:teacherId` - Remove teacher from course

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

## Events Published (Kafka)

- `academic.course.created`
- `academic.course.updated`
- `academic.course.deleted`
- `academic.teacher.assigned`

## Datastores

- PostgreSQL (Prisma): courses, teacher_courses, academic_periods
- Kafka: course events

## Database Schema

- `courses`: Course master data
- `teacher_courses`: Many-to-many relationship between teachers and courses
- `academic_periods`: Optional academic periods

## Run Locally (Node)

1. `cd apps/course-service`
2. `cp .env.example .env` and update DATABASE_URL
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:migrate`
6. `npm run start:dev`

Swagger: `http://localhost:3004/api/docs`

## Run Locally (Docker Compose)

1. Update `DATABASE_URL` in docker-compose.yml
2. `docker compose -f infra/docker/docker-compose.local.yml up --build course-service`
3. Run migrations: `DATABASE_URL=postgresql://edu:edu@localhost:5434/coursedb npx prisma migrate deploy`

## Tests

- Unit: `npm run test:unit`

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Service port (default: 3004)
- `KAFKA_BROKERS` - Kafka brokers (comma-separated)
- `KAFKA_ENABLED` - Enable/disable Kafka (default: true)
- `CORS_ORIGINS` - Allowed CORS origins
- `SWAGGER_ENABLED` - Enable Swagger (default: true)
