# Schedule Service API (schedule-service)

**Domain:** Tutoring Schedule  
**Service Name:** schedule-service  
**API Version:** v1  
**Base Path:** /api/v1/schedule  
**Data Stores:** Postgres (Prisma)  
**Protocols:** REST + Kafka (events)

---

## 1) Purpose
Manage teacher availability slots and prevent scheduling conflicts.

---

## 2) Non-Negotiables
- Singleton pattern for configuration access.
- JWT + RBAC for write operations.
- Availability conflicts prevented at service level.

---

## 3) Data Model (High-Level)
- availability_slots (uuid, teacher_id, start_time, end_time, status)

---

## 4) Endpoints
- POST /availability
- GET /availability/teacher/:teacherId
- DELETE /availability/:id

---

## 5) Events (Kafka)
- tutoring.availability.created

---

## 6) Integrations
- tutoring-service consumes availability events.

---

## 7) Observability
- /health and /ready endpoints.
- Logs include correlationId.

---

## 8) QA vs PROD
- CORS allowlist per environment.

---

## 9) Acceptance Criteria
- Availability slots can be created and removed.
- Event published on create.
