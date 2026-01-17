# Automation Service API (automation-service)

**Domain:** Automation  
**Service Name:** automation-service  
**API Version:** v1  
**Base Path:** /api/v1/automation  
**Data Stores:** none (integration service)  
**Protocols:** REST + RabbitMQ + MQTT  

---

## 1) Purpose
Trigger lightweight automation workflows. Demonstrates RabbitMQ publishing/consuming and MQTT pub/sub.

---

## 2) Endpoints

### POST /publish
Publish a message to MQTT topic `edu/automation/events`.

**Request example:**
```json
{
  "eventType": "automation.demo",
  "payload": { "message": "hello" },
  "correlationId": "uuid"
}
```

**Response:**
```json
{ "message": "Published" }
```

### POST /queue
Publish a message to RabbitMQ queue `automation.jobs`.

**Request example:**
```json
{
  "jobType": "demo",
  "payload": { "message": "hello" },
  "correlationId": "uuid"
}
```

**Response:**
```json
{ "message": "Queued" }
```

---

## 3) Messaging
- RabbitMQ: queue `automation.jobs`
- MQTT: topic `edu/automation/events`

---

## 4) Observability
- Logs include `correlationId`.

---

## 5) QA vs PROD
- MQTT broker URL is environment-based.
- RabbitMQ credentials via env vars.
