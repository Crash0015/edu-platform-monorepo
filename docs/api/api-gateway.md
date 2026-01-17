# API Gateway (api-gateway)

**Service Name:** api-gateway  
**API Version:** v1  
**Role:** Single entry point for external clients; thin routing layer.  

---

## 1) Purpose
Route external requests to backend services, enforce cross-cutting policies (CORS, auth, rate limits).

---

## 2) Endpoints
- `/health` and `/ready`
- Reverse-proxy routes to services (auth, enrollment, notification, automation, search, etc.)

---

## 3) Security
- JWT verification and RBAC checks
- Centralized rate limiting

---

## 4) Acceptance Criteria
- Gateway proxies at least one service route.
