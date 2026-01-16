# Search Service API (search-service)

**Domain:** Search & Discovery  
**Service Name:** search-service  
**API Version:** v1  
**Base Path:** /api/v1/search  
**Data Stores:** MongoDB (projection)  
**Protocols:** REST + Kafka (consumer)  

---

## 1) Purpose
Build a minimal read projection from Kafka events and expose query endpoints.

---

## 2) Endpoints

### GET /enrollments/:studentId
Return enrollment projections for a student.

**Response example:**
```json
{
  "studentId": "uuid",
  "enrollments": [
    { "courseId": "uuid", "status": "ACTIVE" }
  ]
}
```

---

## 3) Event Consumption (Kafka)
- Consumes `enrollment.enrollment.created`
- Updates projection store

---

## 4) Observability
- Logs include `correlationId`.
