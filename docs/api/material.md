# Material Service API (material-service)

**Domain:** Content & Materials  
**Service Name:** material-service  
**API Version:** v1  
**Base Path:** /api/v1/materials  
**Data Stores:** Strapi (PaaS CMS), optional S3 for assets  
**Protocols:** REST + Strapi API

---

## 1) Purpose
Proxy and secure access to educational materials stored in Strapi. Handles publication workflow and RBAC.

---

## 2) Non-Negotiables
- Factory Method for material content types (PDF, LINK, VIDEO).
- Strapi is never exposed directly to public clients.
- JWT + RBAC for all write operations.

---

## 3) Data Model (High-Level)
- materials (uuid, title, type, course_id, status, published_at)
- assets (url, metadata) managed by Strapi

---

## 4) Endpoints
- POST /
- GET /
- GET /:id
- PATCH /:id
- DELETE /:id
- POST /:id/publish

---

## 5) Events (Kafka)
- content.material.published

---

## 6) Integrations
- Strapi CMS as content store.
- notification-service may consume publish events.

---

## 7) Observability
- /health and /ready endpoints.
- Logs include correlationId.

---

## 8) QA vs PROD
- Strapi credentials via env vars.
- CORS allowlist per environment.

---

## 9) Acceptance Criteria
- CRUD proxies to Strapi.
- Publish endpoint emits event.
