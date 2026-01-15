# PROJECT RULES — EDU Platform Monorepo (Cursor + Replicable Domains)

## Goal

Build a semester project as a **production-like monorepo** with:

- Microservices
- Strong security
- Real databases
- Event-driven integration
- CI/CD
- Professional documentation

This document is written to:

1. keep the project consistent (so you don’t lose context), and
2. be **replicable** for every domain/service you build next.

---

## 1) What is mandatory for ALL services vs only SOME services?

### 1.1 Mandatory for ALL microservices (baseline)

Every backend microservice must include:

- **Layered / Hexagonal internal structure** (clean separation)
- **REST API** + Swagger (OpenAPI) with real DTOs, examples and error responses
- **Health endpoints**: `/health` and `/ready`
- **Dockerfile** (multistage) + `.dockerignore`
- **Tests**
  - Unit tests (core use cases)
  - At least one integration/e2e test (real DB container in CI or local compose)
- **Observability hooks**
  - Structured logs (JSON)
  - correlationId propagation
  - `/metrics` optional (Prometheus format)
- **Security baseline**
  - DTO validation
  - Rate limiting for sensitive endpoints (Redis)
  - Explicit CORS per environment

This baseline is what makes service #2, #3, #4… fast to replicate.

---

## 2) CQRS: Do ALL services use it?

### 2.1 Correct answer: NOT all services need strong CQRS

CQRS is applied at two levels.

### Level A — CQRS Light (MOST services)

- **Command = write** (create/update/delete)
- **Query = read** (get/list/search)
- Separation exists in **code structure**, not duplicated databases

This is enough to state that CQRS principles are applied.

### Level B — CQRS Strong (1–2 key services)

Used only where it adds real value:

- Separate **read model** (table, view, materialized view, or different DB)
- Read model updated via **Kafka events**
- Projection worker allowed

**Recommendation**

- Strong CQRS in **Enrollment**
- Optional in **Reporting / Analytics**
- **Auth remains CQRS-light**

---

## 3) Event-Driven Architecture (Mandatory Kafka)

### 3.1 Rule

Kafka is the primary event bus for cross-service communication.

### 3.2 Event Envelope Standard

All services must publish events with this envelope:

- eventId (uuid)
- eventType (domain.aggregate.action)
- occurredAt (ISO-8601)
- correlationId (uuid)
- actorUserId (uuid)
- payload (object)

### 3.3 No sensitive data rule

Never publish:

- passwords
- access tokens
- refresh tokens
- reset tokens
- MFA secrets
- secrets or keys

---

## 4) Databases (Rubric requires at least 3 types, one cache)

### 4.1 Platform target

- **Postgres** — primary transactional DB
- **Redis** — cache, rate limiting, locks
- **One additional DB**
  - MongoDB OR
  - Elasticsearch / OpenSearch OR
  - DynamoDB OR
  - ClickHouse

**Rule:** Services never share databases.

---

## 5) Security standards (baseline)

- JWT validation via shared auth library
- RBAC roles: ADMIN, TEACHER, STUDENT
- Rate limiting on sensitive routes
- Explicit CORS allowlist (QA / PROD)
- DTO + class-validator
- Logs must include correlationId

---

## 6) Auth-service special rules (Institutional email only)

Auth service must enforce:

- Only emails ending with `@uce.edu.ec`
- Forgot-password always returns 200
- Refresh token rotation + reuse detection
- Store only hashed refresh/reset tokens
- TOTP MFA (RFC 6238)
- Emit auth events to Kafka

Auth uses:

- Prisma + Postgres
- Redis
- Kafka

---

## 7) Replicable Service Template

### 7.1 Where services live

Recommended:

apps/backend/<domain>/<service-name>/

---

### 7.2 Internal folder structure (MANDATORY)

src/
presentation/
application/
domain/
infrastructure/
shared/
test/
Dockerfile
.dockerignore
README.md
SERVICE_SPEC.md

---

### 7.3 README requirements

- Purpose
- Endpoints
- Events published / consumed
- Databases
- How to run locally
- How to run tests
- Trade-offs

---

## 8) Documentation format

For each service:

- docs/api/<service>.md
- docs/security/<service>.md
- Register events in docs/architecture/event-catalog.md

Sections:

- Purpose
- Non-negotiables
- Data model
- Endpoints
- Events
- Integrations
- Observability
- QA vs PROD
- Acceptance criteria

---

## 9) CI/CD & DockerHub

Each service must support:

- Lint
- Unit tests
- Integration/e2e test
- Docker build
- Docker push on main

Use Conventional Commits.

---

## 10) Cursor rules

### 10.1 .cursorrules

Location: repo root  
Purpose: global AI rules

### 10.2 .cursor/rules/\*.mdc

Context-specific rules (auth, prisma, swagger, docker)

---

## 11) Execution plan

Step 1 — Build Auth service as gold standard  
Step 2 — Extract shared libs

- libs/shared/auth
- libs/shared/logger
- libs/contracts/events

Step 3 — Build services 2..10  
Step 4 — Platform infrastructure (Terraform, gateway, monitoring)

---

## 12) Replicable system acceptance

You can create a new service by:

1. Writing docs/api/<service>.md
2. Running: “Implement this spec”

And it includes automatically:

- Layered structure
- Swagger
- Docker
- Tests
- Kafka events
- CorrelationId logging
- RBAC guards
