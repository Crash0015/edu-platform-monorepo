# Notification Service API (notification-service)

**Domain:** Notification & Communication  
**Service Name:** notification-service  
**API Version:** v1  
**Base Path:** /api/v1/notifications  
**Data Stores:** RabbitMQ (queue processing), optional Postgres/Mongo (future)  
**Protocols:** REST + RabbitMQ  

---

## 1) Purpose
Handle async delivery of notifications. This service **consumes** messages from RabbitMQ and exposes a REST endpoint to enqueue notification jobs.

---

## 2) Non-Negotiables
- No sensitive data in queue payloads (no passwords/tokens).
- Idempotent processing for at-least-once delivery.
- Health endpoints `/health` and `/ready`.

---

## 3) Endpoints

### POST /email
Enqueue an email notification job.

**Request example:**
```json
{
  "to": "student@uce.edu.ec",
  "subject": "Password reset",
  "body": "Your reset link is ...",
  "correlationId": "uuid"
}
```

**Response:**
```json
{
  "message": "Notification queued"
}
```

---

## 4) Queue Integration (RabbitMQ)
- Queue: `notifications.email`
- Payload fields: `to`, `subject`, `body`, `correlationId`

---

## 5) Observability
- Structured logs include `correlationId`.

---

## 6) QA vs PROD
- RabbitMQ connection string via env vars.

---

## 7) Acceptance Criteria
- REST endpoint enqueues a message to RabbitMQ.
- Consumer processes messages from `notifications.email`.
