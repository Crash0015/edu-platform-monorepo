# Course Service API (course-service)

**Domain:** Academic Management  
**Service Name:** course-service  
**API Version:** v1  
**Base Path:** /api/v1/courses  
**Data Stores:** Postgres (Prisma), MongoDB (read projections)  
**Protocols:** REST + GraphQL + Kafka (events)

---

## 1) Purpose
Manage courses, teacher assignments, and course metadata. Exposes REST for writes and GraphQL for read-heavy queries.

---

## 2) Non-Negotiables
- Builder pattern for course creation in application layer.
- JWT + RBAC for all mutation endpoints.
- No cross-service database access.
- Events published without sensitive data.

---

## 3) Data Model (High-Level)
- courses (uuid, code, name, description, status, created_at)
- teacher_courses (teacher_id, course_id)
- academic_periods (optional)

---

## 4) Endpoints (REST)
- POST /
- GET /
- GET /:id
- PATCH /:id
- DELETE /:id

---

## 5) GraphQL
- POST /graphql
- Queries for course lists, course detail, and teacher assignments.

---

## 6) Events (Kafka)
- academic.course.created

---

## 7) Integrations
- search-service consumes course events for projections.

---

## 8) Observability
- /health and /ready endpoints.
- Logs include correlationId.

---

## 9) QA vs PROD
- Swagger enabled in QA.
- CORS allowlist per environment.

---

## 10) Acceptance Criteria
- Course CRUD works via REST.
- GraphQL returns course projections.
- Event published on create.
