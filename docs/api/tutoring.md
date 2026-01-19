# Tutoring Service API (tutoring-service)

**Domain:** Tutoring Booking  
**Service Name:** tutoring-service  
**API Version:** v1  
**Base Path:** /api/v1/tutoring  
**Data Stores:** Postgres (Prisma)  
**Protocols:** REST + Kafka (events)

---

## 1) Purpose
Reserve and manage tutoring sessions based on teacher availability.

---

## 2) Non-Negotiables
- Proxy pattern to validate availability before booking.
- JWT + RBAC for all mutation endpoints.
- Booking operations must be idempotent.

---

## 3) Data Model (High-Level)
- tutoring_sessions (uuid, teacher_id, student_id, status, start_time, end_time)

---

## 4) Endpoints
- GET /sessions/available
- POST /sessions/reserve
- POST /sessions/cancel
- GET /sessions/:id

---

## 5) Events (Kafka)
- tutoring.session.reserved

---

## 6) Integrations
- schedule-service for availability validation.
- notification-service for booking notifications.

---

## 7) Observability
- /health and /ready endpoints.
- Logs include correlationId.

---

## 8) QA vs PROD
- CORS allowlist per environment.

---

## 9) Acceptance Criteria
- Booking flow works end-to-end.
- Event published on reservation.
