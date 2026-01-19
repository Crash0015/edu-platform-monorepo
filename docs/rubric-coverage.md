# Rubric Coverage Map (System-Level)

This rubric is evaluated at the **system level**, not per service. The communication protocols and architectures are intentionally **distributed** across services to keep each service cohesive and aligned with its domain. See ADR-009 and ADR-010 for the gateway and multi-protocol rationale, and ADR-011 for Event-Driven + CQRS decisions.【F:docs/architecture/decisions.md†L166-L227】

## Distribution Rationale
- **REST everywhere** provides consistent, minimal service interfaces.
- **Kafka** is the event backbone for core domain services.
- **RabbitMQ** is reserved for background/async processing.
- **MQTT** demonstrates lightweight pub/sub integration.
- **Architectures** are split: auth-service uses layered/hexagonal; api-gateway uses MVC/layered (thin controllers).【F:docs/architecture/decisions.md†L166-L199】

## Rubric Mapping

| # | Requirement | Owner service(s) | Evidence (paths) | Status |
|---|-------------|------------------|------------------|--------|
| 1 | Monorepo | Repo root | `docs/architecture/decisions.md` (ADR-001)【F:docs/architecture/decisions.md†L9-L24】 | Implemented |
| 2 | Language + framework | All services | `docs/architecture/decisions.md` (ADR-003)【F:docs/architecture/decisions.md†L55-L72】 | Implemented |
| 3 | Multiplatform + roles | web-dashboard + auth-service | `docs/architecture/decisions.md` (ADR-004), `apps/auth-service/src/shared/constants/roles.constants.ts`【F:docs/architecture/decisions.md†L76-L88】【F:apps/auth-service/src/shared/constants/roles.constants.ts†L1-L7】 | Partial |
| 4 | 10+ microservices | System | `docs/architecture/decisions.md` (ADR-002), `docs/architecture/domains.md` (service list)【F:docs/architecture/decisions.md†L27-L51】【F:docs/architecture/domains.md†L240-L253】 | Partial |
| 5 | Security (JWT, CORS, rate limit, bastion, firewall) | auth-service + infra | JWT/CORS/rate limit in auth-service; infra items documented in ADR-013/ADR-014【F:apps/auth-service/src/infrastructure/security/token.service.ts†L12-L115】【F:apps/auth-service/src/main.ts†L14-L37】【F:docs/architecture/decisions.md†L251-L288】 | Partial |
| 6 | AWS + PaaS | material-service + infra | ADR-008 (Strapi PaaS)【F:docs/architecture/decisions.md†L148-L162】 | Planned |
| 7 | CI/CD (GitHub Actions) | System | `.github/workflows/ci.yml`, `.github/workflows/docker-publish.yml`【F:.github/workflows/ci.yml†L1-L45】【F:.github/workflows/docker-publish.yml†L1-L31】 | Implemented |
| 8 | Testing (unit/functional/load) in CI/CD | All services | Unit tests for auth/enrollment/course/user + auth e2e + load test in CI【F:.github/workflows/ci.yml†L1-L122】【F:apps/course-service/src/application/courses.service.spec.ts†L1-L26】【F:apps/user-service/src/application/users.service.spec.ts†L1-L28】 | Partial |
| 9 | Docker registry (DockerHub/GHCR) | System | Docker push workflow includes auth/api-gateway/notification/automation/enrollment/search/course/user【F:.github/workflows/docker-publish.yml†L1-L42】 | Implemented |

| 10 | Design principles (SOLID, DRY, KISS, Low Coupling/High Cohesion) | System | SRP/DIP via ports in auth-service; layering in auth-service【F:apps/auth-service/src/application/auth/ports/auth.repositories.ts†L1-L74】【F:apps/auth-service/src/presentation/auth/auth.module.ts†L1-L77】 | Partial |
| 11 | 3+ DB types (one cache) | System | ADR-007 data store strategy【F:docs/architecture/decisions.md†L126-L145】 | Partial |
| 12 | ELB + ASG | Infra | ADR-016 (HA strategy)【F:docs/architecture/decisions.md†L311-L327】 | Missing |
| 13 | Terraform | Infra | ADR-017 (IaC decision)【F:docs/architecture/decisions.md†L331-L349】 | Missing |
| 14 | API Gateway | api-gateway | Gateway proxy controller and service (auth + enrollment assign)【F:apps/api-gateway/src/presentation/gateway/gateway.controller.ts†L1-L36】【F:apps/api-gateway/src/application/gateway/gateway.service.ts†L1-L30】 | Implemented |

| 15 | Comms (REST + Kafka/RabbitMQ/MQTT) | System | Kafka in auth/enrollment, RabbitMQ in notification/automation, MQTT in automation【F:apps/auth-service/src/infrastructure/kafka/kafka.service.ts†L1-L57】【F:apps/enrollment-service/src/infrastructure/kafka/kafka.service.ts†L1-L57】【F:apps/notification-service/src/infrastructure/rabbitmq/rabbitmq.service.ts†L1-L50】【F:apps/automation-service/src/infrastructure/mqtt/mqtt.service.ts†L1-L39】 | Implemented |
| 16 | Architectures (≥2) + EDA + CQRS | System | Layered auth-service; MVC-style api-gateway; EDA via Kafka events【F:apps/auth-service/src/app.module.ts†L1-L20】【F:apps/api-gateway/src/app.module.ts†L1-L18】【F:docs/architecture/decisions.md†L211-L221】 | Implemented |
| 17 | Monitoring & alerting (Prometheus/Grafana) | monitoring | ADR-017/ADR-018 references; monitoring implementation missing【F:docs/architecture/decisions.md†L331-L349】 | Missing |
| 18 | High availability | Infra | ADR-016 (HA strategy)【F:docs/architecture/decisions.md†L311-L327】 | Missing |
| 19 | On-prem backups | Infra | ADR-020 (backup integration)【F:docs/architecture/decisions.md†L393-L407】 | Missing |
| 20 | n8n automation | automation-service | ADR-021 (n8n automation)【F:docs/architecture/decisions.md†L411-L423】 | Missing |
| 21 | Documentation (Swagger, conventional commits, README) | System | Swagger in auth-service; conventional commits required by ADR-022【F:apps/auth-service/src/main.ts†L39-L48】【F:docs/architecture/decisions.md†L431-L445】 | Partial |

## Notes
- Missing items are documented **before implementation** to keep rubric evidence auditable.
- Protocol distribution is intentional to avoid coupling and keep each service focused on its domain. This aligns with ADR-002 and ADR-010 decisions.【F:docs/architecture/decisions.md†L27-L51】【F:docs/architecture/decisions.md†L187-L199】

## Design Principles Evidence
- **SOLID (SRP):** Controllers only orchestrate requests; business logic is in application services.【F:apps/auth-service/src/presentation/auth/auth.controller.ts†L33-L147】【F:apps/auth-service/src/application/auth/auth.service.ts†L60-L166】
- **SOLID (DIP):** Application layer depends on ports/interfaces; infrastructure implements adapters.【F:apps/auth-service/src/application/auth/ports/auth.repositories.ts†L1-L74】【F:apps/auth-service/src/infrastructure/repositories/user.repository.ts†L1-L53】
- **DRY:** Shared middleware and filters are reused across services for correlationId and error shaping.【F:apps/auth-service/src/shared/middleware/correlation-id.middleware.ts†L1-L17】【F:apps/notification-service/src/shared/middleware/correlation-id.middleware.ts†L1-L17】
- **KISS:** Minimal, single-purpose endpoints for queue/publish actions in automation and notification services.【F:apps/automation-service/src/presentation/automation/automation.controller.ts†L1-L26】【F:apps/notification-service/src/presentation/notifications/notification.controller.ts†L1-L17】
- **Low Coupling / High Cohesion:** Messaging adapters isolate RabbitMQ/MQTT/Kafka from application logic.【F:apps/automation-service/src/infrastructure/rabbitmq/automation-queue.adapter.ts†L1-L14】【F:apps/enrollment-service/src/application/enrollments/enrollment.service.ts†L1-L38】
