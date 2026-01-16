# Enrollment Service API (enrollment-service)

**Domain:** Enrollment  
**Service Name:** enrollment-service  
**API Version:** v1  
**Base Path:** /api/v1/enrollments  
**Data Stores:** Postgres (Prisma)  
**Protocols:** REST + Kafka  

---

## 1) Purpose
Handle student enrollment and publish enrollment events.

---

## 2) Endpoints

### POST /
Create an enrollment and emit `enrollment.enrollment.created`.

**Request example:**
```json
{
  "studentId": "uuid",
  "courseId": "uuid",
  "correlationId": "uuid"
}
```

**Response example:**
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "courseId": "uuid",
  "status": "ACTIVE"
}
```

---

## 3) Events (Kafka)
- Topic: `enrollment.enrollment.created`
- Envelope: standard event envelope (see event catalog)

---

## 4) Observability
- Logs include `correlationId`.

---

## 5) Acceptance Criteria
- Enrollment is persisted.
- Event is published with `correlation_id`.
