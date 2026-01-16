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
| 7 | CI/CD (GitHub Actions) | System | ADR-018 (CI/CD standard)【F:docs/architecture/decisions.md†L353-L369】 | Missing |
| 8 | Testing (unit/functional/load) in CI/CD | All services | auth-service tests exist; load testing required by ADR-019【F:apps/auth-service/src/application/auth/auth.service.spec.ts†L1-L162】【F:docs/architecture/decisions.md†L373-L381】 | Partial |
| 9 | Docker registry (DockerHub/GHCR) | System | Dockerfiles in services; push required by ADR-018【F:apps/auth-service/Dockerfile†L1-L21】【F:docs/architecture/decisions.md†L353-L360】 | Partial |
| 10 | Design principles (SOLID, DRY, KISS, Low Coupling/High Cohesion) | System | SRP/DIP via ports in auth-service; layering in auth-service【F:apps/auth-service/src/application/auth/ports/auth.repositories.ts†L1-L74】【F:apps/auth-service/src/presentation/auth/auth.module.ts†L1-L77】 | Partial |
| 11 | 3+ DB types (one cache) | System | ADR-007 data store strategy【F:docs/architecture/decisions.md†L126-L145】 | Partial |
| 12 | ELB + ASG | Infra | ADR-016 (HA strategy)【F:docs/architecture/decisions.md†L311-L327】 | Missing |
| 13 | Terraform | Infra | ADR-017 (IaC decision)【F:docs/architecture/decisions.md†L331-L349】 | Missing |
| 14 | API Gateway | api-gateway | ADR-009 (gateway pattern)【F:docs/architecture/decisions.md†L166-L183】 | Missing |
| 15 | Comms (REST + Kafka/RabbitMQ/MQTT) | System | ADR-010 + event catalog; Kafka already in auth-service【F:docs/architecture/decisions.md†L187-L199】【F:docs/architecture/event-catalog.md†L121-L179】【F:apps/auth-service/src/infrastructure/kafka/kafka.service.ts†L1-L57】 | Partial |
| 16 | Architectures (≥2) + EDA + CQRS | System | ADR-011 (EDA + CQRS); auth-service layered architecture【F:docs/architecture/decisions.md†L211-L221】【F:apps/auth-service/src/app.module.ts†L1-L20】 | Partial |
| 17 | Monitoring & alerting (Prometheus/Grafana) | monitoring | ADR-017/ADR-018 references; monitoring implementation missing【F:docs/architecture/decisions.md†L331-L349】 | Missing |
| 18 | High availability | Infra | ADR-016 (HA strategy)【F:docs/architecture/decisions.md†L311-L327】 | Missing |
| 19 | On-prem backups | Infra | ADR-020 (backup integration)【F:docs/architecture/decisions.md†L393-L407】 | Missing |
| 20 | n8n automation | automation-service | ADR-021 (n8n automation)【F:docs/architecture/decisions.md†L411-L423】 | Missing |
| 21 | Documentation (Swagger, conventional commits, README) | System | Swagger in auth-service; conventional commits required by ADR-022【F:apps/auth-service/src/main.ts†L39-L48】【F:docs/architecture/decisions.md†L431-L445】 | Partial |

## Notes
- Missing items are documented **before implementation** to keep rubric evidence auditable.
- Protocol distribution is intentional to avoid coupling and keep each service focused on its domain. This aligns with ADR-002 and ADR-010 decisions.【F:docs/architecture/decisions.md†L27-L51】【F:docs/architecture/decisions.md†L187-L199】
