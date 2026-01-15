# Event Catalog – Educational Platform

**Date:** 2026-01-12
**Architecture Style:** Event-Driven Architecture (EDA) + CQRS
**Primary Message Broker:** Apache Kafka
**Secondary Messaging:** RabbitMQ (async tasks), MQTT (lightweight notifications)

---

## 1. Purpose

This document defines the **canonical catalog of domain events** emitted by the microservices of the Educational Platform.

Events are used to:

- Decouple microservices
- Enable audit and compliance
- Trigger notifications and automations (n8n)
- Build CQRS read projections (search, dashboards)
- Ensure traceability and observability across the system

Events represent **facts that already happened** in the system and must be treated as immutable.

---

## 2. Event Design Principles

### 2.1 General Rules

- Events are **immutable**.
- Events are **published only after successful transactions**.
- Events use **past tense naming**.
- Events do **not contain sensitive data** (passwords, secrets, tokens).
- Events are **versioned** (`event_version`).
- Events are published using the **Outbox Pattern** when possible.

### 2.2 Event Ownership

- Each event is **owned by exactly one microservice**.
- Only the owning service may emit the event.
- Other services may **consume** but never modify the event.

### 2.3 Event Granularity

- Events represent **business-level facts**, not technical actions.
- Avoid chatty or overly fine-grained events.

---

## 3. Standard Event Envelope

All events follow a **common envelope** to ensure consistency and traceability.

```json
{
  "event_id": "UUID",
  "event_type": "EVENT_NAME",
  "event_version": 1,
  "occurred_at": "ISO-8601 timestamp",
  "producer": "service-name",
  "correlation_id": "UUID",
  "actor_user_id": "UUID | null",
  "payload": {}
}
```

### Field Description

| Field            | Description                                                |
| :--------------- | :--------------------------------------------------------- |
| `event_id`       | Unique identifier of the event                             |
| `event_type`     | Canonical event name                                       |
| `event_version`  | Event schema version                                       |
| `occurred_at`    | Timestamp when the event occurred                          |
| `producer`       | Microservice that emitted the event                        |
| `correlation_id` | Used to trace a request across services                    |
| `actor_user_id`  | User who triggered the event (nullable for system actions) |
| `payload`        | Business-specific event data                               |

---

## 4. Kafka Topic Conventions

**Topic name format:**
`<domain>.<aggregate>.<event>`

**Examples:**

- `iam.user.created`
- `iam.user.logged_in`
- `academic.course.created`
- `enrollment.enrollment.created`

---

## 5. Identity & Access Events (Auth-Service)

### 5.1 USER_CREATED

- **Producer:** `auth-service`
- **Topic:** `iam.user.created`
- **Version:** 1

**Description:** A new user (teacher, student, admin) was created in the system.

```json
{
  "user_id": "UUID",
  "email": "string",
  "user_type": "TEACHER | STUDENT | ADMIN",
  "status": "ACTIVE"
}
```

**Consumers:**

- `audit-service`
- `notification-service`
- `search-service`

### 5.2 USER_LOGGED_IN

- **Producer:** `auth-service`
- **Topic:** `iam.user.logged_in`
- **Version:** 1

**Description:** A user successfully authenticated.

```json
{
  "user_id": "UUID",
  "email": "string",
  "login_method": "PASSWORD | REFRESH_TOKEN",
  "ip": "string | null",
  "user_agent": "string | null"
}
```

**Consumers:**

- `audit-service`
- `security-monitoring-service`
- `automation-service` (n8n)

### 5.3 PASSWORD_RESET_REQUESTED

- **Producer:** `auth-service`
- **Topic:** `iam.user.password_reset_requested`
- **Version:** 1

**Description:** A password reset request was initiated.

```json
{
  "user_id": "UUID",
  "email": "string",
  "expires_at": "ISO-8601 timestamp"
}
```

**Consumers:**

- `notification-service` (email/SMS)
- `audit-service`

### 5.4 PASSWORD_RESET_COMPLETED

- **Producer:** `auth-service`
- **Topic:** `iam.user.password_reset_completed`
- **Version:** 1

**Description:** A password reset was successfully completed.

```json
{
  "user_id": "UUID",
  "email": "string"
}
```

**Consumers:**

- `audit-service`
- `security-monitoring-service`

---

## 6. Academic Management Events (Course-Service)

### 6.1 COURSE_CREATED

- **Producer:** `course-service`
- **Topic:** `academic.course.created`
- **Version:** 1

```json
{
  "course_id": "UUID",
  "code": "string",
  "name": "string",
  "period_id": "UUID | null"
}
```

**Consumers:**

- `search-service`
- `audit-service`

---

## 7. Enrollment Events (Enrollment-Service)

### 7.1 ENROLLMENT_CREATED

- **Producer:** `enrollment-service`
- **Topic:** `enrollment.enrollment.created`
- **Version:** 1

```json
{
  "enrollment_id": "UUID",
  "student_id": "UUID",
  "course_id": "UUID"
}
```

**Consumers:**

- `audit-service`
- `notification-service`
- `search-service`

---

## 8. Tutoring Events

### 8.1 AVAILABILITY_CREATED

- **Producer:** `schedule-service`
- **Topic:** `tutoring.availability.created`

```json
{
  "availability_id": "UUID",
  "teacher_id": "UUID",
  "start_time": "ISO-8601",
  "end_time": "ISO-8601"
}
```

### 8.2 TUTORING_RESERVED

- **Producer:** `tutoring-service`
- **Topic:** `tutoring.session.reserved`

```json
{
  "tutoring_session_id": "UUID",
  "student_id": "UUID",
  "teacher_id": "UUID"
}
```

---

## 9. Content & Materials Events

### 9.1 MATERIAL_PUBLISHED

- **Producer:** `material-service`
- **Topic:** `content.material.published`

```json
{
  "material_id": "UUID",
  "course_id": "UUID",
  "teacher_id": "UUID",
  "type": "PDF | LINK | VIDEO"
}
```

**Consumers:**

- `search-service`
- `notification-service`
- `audit-service`

---

## 10. Audit & Observability

- All business events are consumed by `audit-service`.
- Audit logs are **append-only**.
- `Correlation IDs` enable request tracing across microservices.

---

## 11. Automation (n8n Integration)

Events may trigger:

- Email notifications
- Scheduled follow-ups
- Reporting workflows

n8n subscribes to Kafka topics via connectors or bridge services.

---

## 12. Reliability & Delivery Guarantees

- **Delivery:** at-least-once.
- **Idempotency:** handled by consumers.
- **Publishing:** via Outbox Pattern recommended.
- **Failure handling:** Failed events routed to retry or dead-letter topics.

---

## 13. Versioning Strategy

- **Backward-compatible changes:** increment minor fields.
- **Breaking changes:** increment `event_version`.
- Consumers must support multiple versions if needed.

---

## 14. Summary

This event catalog defines the contractual backbone of the platform’s Event-Driven Architecture, enabling scalability, resilience, auditability, and loose coupling across microservices.
