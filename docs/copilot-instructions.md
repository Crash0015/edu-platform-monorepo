# Copilot Instructions – EDU Platform Monorepo

You are assisting in a large educational platform monorepo. You MUST follow the repository documentation as source of truth and comply with the project rubric.

If information is missing or unclear, DO NOT invent. Instead:

1. propose the missing spec/update inside docs,
2. then implement after the docs are updated.

---

## 1) Source of Truth (Read before coding)

You must use these documents in priority order:

1. docs/rubric.md
2. docs/architecture/decisions.md
3. docs/architecture/domains.md
4. docs/architecture/data-model.md
5. docs/architecture/event-catalog.md
6. docs/api/ (service API contracts, e.g., docs/api/auth.md)
7. repository README.md and service READMEs/SERVICE_SPEC.md when present

If a requirement conflicts, rubric takes precedence, then architecture docs.

---

## 2) Global Non-Negotiables (Must Always Hold)

### Identity & Data

- All IDs are UUID (no incremental IDs).
- Transactional data uses PostgreSQL normalized to 3NF.
- Redis is cache/locks/rate limits only (NOT a system of record).
- Content uses Strapi (PaaS) + S3 for assets.
- Services do not share databases and must not do cross-service joins at runtime.

### Security

- JWT access + refresh with refresh rotation.
- Never store raw refresh tokens or raw password reset tokens; store hashes only.
- RBAC is mandatory: TEACHER/STUDENT/ADMIN (+ permissions if used).
- No hardcoded credentials/users in code (only controlled dev seed if required).
- CORS must be explicit and environment-based.
- Rate limiting is required (at least per IP/per route in auth).

### Integration & Architecture

- Kafka is the primary event bus and is mandatory.
- RabbitMQ and MQTT are also mandatory in the overall system (used by designated services).
- Architecture must be microservices + Event-Driven + CQRS. Inside services use a clean structure (Layered/Hexagonal style).
- Consumers must be idempotent because delivery is at-least-once.

### Quality

- Each service must have Swagger/OpenAPI.
- Logging must be structured and include correlation_id where applicable.
- Testing: baseline unit + integration/e2e (minimal but real) per service.
- Dockerized services; local dev uses docker compose, production uses IaC (Terraform).

---

## 3) Event Rules (Kafka)

- Event envelope, naming, and topics must follow docs/architecture/event-catalog.md
- No sensitive data in events (no passwords, no tokens, no secrets).
- Include correlation_id and actor_user_id when available.
- Topic naming convention: <domain>.<aggregate>.<event>
- Prefer Outbox pattern for reliable publishing; if omitted, document why.

---

## 4) Code Generation Output Format (MANDATORY)

When generating code for multiple files, ALWAYS output a FILE MANIFEST:

FILE: path/to/file
<full content>

FILE: path/to/another/file
<full content>

Rules:

- No placeholders.
- No pseudo-code.
- No “TODO-only” files.
- All files must be complete and compilable.

---

## 5) Auth-Service Specific Rules (apps/auth-service)

### 5.1 Tech Stack

- NestJS + TypeScript
- Postgres persistence via Prisma
- Config via environment variables only

### 5.2 Must Implement (Functional)

- POST /auth/login (email+password)
- POST /auth/refresh (refresh rotation; old refresh revoked, new refresh issued)
- POST /auth/logout (revoke refresh token/session)
- GET /auth/me (from access token)
- POST /auth/forgot-password (no user enumeration; always 200)
- POST /auth/reset-password (single-use reset token)
- GET /health

Endpoints and request/response must match docs/api/auth.md.

### 5.3 Persistence Requirements

- users
- roles
- permissions (optional but recommended for rubric)
- user_roles
- role_permissions
- password_reset_tokens (hash + expiry + used_at)
- refresh_tokens/sessions (hash + expiry + revoked_at + rotation support)

Do NOT store raw refresh tokens or raw reset tokens.

### 5.4 RBAC

- Implement RolesGuard + Roles decorator
- Ensure /auth/me requires valid access token
- For future services: provide a reusable JWT auth guard package if possible

### 5.5 Events (Kafka)

Auth-service must emit:

- USER_LOGGED_IN (on successful login/refresh)
- PASSWORD_RESET_REQUESTED (when forgot-password requested)
- PASSWORD_RESET_COMPLETED (when reset finished)
  Optionally:
- USER_CREATED (if auth-service owns user creation)

Event payloads/topics must match docs/architecture/event-catalog.md.

### 5.6 Observability

- Include correlation_id handling (propagate header if present; otherwise generate)
- Structured logs: service name + correlation_id + user id when available

### 5.7 Testing

- Unit tests for AuthService (password hashing, token logic)
- Integration/e2e tests for /auth endpoints (happy path + invalid token)
- Tests must run in CI

### 5.8 Docker & Local Dev

- Provide Dockerfile
- Ensure compatibility with infra/docker/docker-compose.local.yml
- Provide migration commands and seed (optional) for dev/demo only

---

## 6) How to Treat Existing Files

When asked to refactor/regenerate a service:

- Prefer replacing only the files specified in the FILE MANIFEST.
- Do not delete files unless explicitly instructed.
- If a clean reset is required, propose a safe “reset plan” (backup + delete src/prisma/test + regenerate).

---

## 7) Rubric Compliance Guidance

When implementing any feature, always map it to the rubric:

- Identify which rubric items are satisfied by the change
- Ensure evidence can be captured (logs/screenshots/tests)

Do not overbuild unnecessary folders; keep it logical and explainable.
