# User Service API (user-service)

**Domain:** Identity & Access (Profile)  
**Service Name:** user-service  
**API Version:** v1  
**Base Path:** /api/v1/users  
**Data Stores:** Postgres (Prisma)  
**Protocols:** REST

---

## 1) Purpose
Manage user profile data that is separate from authentication (display name, profile metadata, status).

---

## 2) Non-Negotiables
- JWT + RBAC for all write operations.
- User-service does not handle credentials or tokens.

---

## 3) Data Model (High-Level)
- users_profile (uuid, user_id, display_name, avatar_url, updated_at)

---

## 4) Endpoints
- GET /:id
- PATCH /:id
- GET /

---

## 5) Events
- None required initially.

---

## 6) Integrations
- auth-service remains the source of truth for credentials.

---

## 7) Observability
- /health and /ready endpoints.
- Logs include correlationId.

---

## 8) QA vs PROD
- CORS allowlist per environment.

---

## 9) Acceptance Criteria
- Profile read/update endpoints work.
