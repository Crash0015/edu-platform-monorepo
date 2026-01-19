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

### POST /assign
Assign a student to a course (teacher only). Validates student status and course capacity.

Required headers:
- `x-user-id`
- `x-user-roles` (must include `TEACHER`)

### POST /
Create an enrollment and emit `enrollment.enrollment.created`.


**Request example:**
```json
{
  "studentId": "11111111-1111-1111-1111-111111111111",
  "courseId": "22222222-2222-2222-2222-222222222222",
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
- Teacher can assign enrollment via POST /assign.
- Student must be ACTIVE and course must have seats.
- Enrollment is persisted.
- Event is published with `correlation_id`.

