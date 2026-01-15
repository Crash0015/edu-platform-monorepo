# Architecture Decisions (ADR) – Educational Platform

**Date:** 2026-01-12  
**Scope:** This document captures the key architectural and technical decisions for the Educational Platform.  
The goal is to ensure the project is **consistent, auditable, secure, scalable**, and aligned with the rubric requirements.

---

## ADR-001 – Monorepo Strategy

**Decision:** Use a single **monorepo** with workspaces for backend services, frontend, shared packages, infrastructure, CI, monitoring, and documentation.

**Rationale:**

- Clear organization and dependency management.
- Simplified CI/CD.
- Enforces shared standards (linting, commit rules, docs).
- Meets rubric requirement: **Mono Repo**.

**Consequences:**

- Requires consistent folder structure and naming conventions.
- Shared code must remain minimal to avoid tight coupling.

---

## ADR-002 – Microservice Architecture aligned to Business Domains (DDD-light)

**Decision:** Adopt **Microservices** aligned to **business domains** (DDD-inspired). Services represent real business processes:

- Identity & Access
- Academic Management
- Enrollment
- Content & Materials
- Schedule
- Tutoring Booking
- Search & Discovery
- Notifications
- Audit & Compliance
- Automation

**Rationale:**

- Matches instructor requirement: “group domains by processes and business logic”.
- Minimizes coupling and improves maintainability.
- Meets rubric requirement: **at least 10 microservices**.

**Consequences:**

- Cross-service operations must be coordinated through events and API contracts.
- No direct cross-database joins.

---

## ADR-003 – Technology Stack (Backend/Frontend)

**Decision:**

- Backend: **Node.js + TypeScript + NestJS**
- Frontend: **Next.js (Web Dashboard)**
- Documentation: Swagger/OpenAPI + Markdown docs

**Rationale:**

- Fast implementation under short deadline.
- NestJS supports modular design, testing, Swagger, security patterns.
- Next.js provides a scalable web UI for teacher dashboard and student portal.

**Consequences:**

- Enforces TypeScript across services.
- Shared DTOs must be managed carefully.

---

## ADR-004 – Multiplatform Strategy

**Decision:** Deliver multiplatform via **Web** (Next.js) + optional **PWA** capabilities.  
Roles/permissions are enforced across teacher and student views.

**Rationale:**

- Meets rubric: “Multiplatform – Web/Mobile/Desktop + roles/permissions”.
- Web + PWA is fastest and practical for the timeline.

**Consequences:**

- Mobile/Desktop are supported via responsive UI and PWA packaging, not separate native apps.

---

## ADR-005 – Identifiers: UUID instead of Incremental IDs

**Decision:** All primary keys are **UUID**. No incremental identifiers are used.

**Rationale:**

- Matches instructor requirement: “unicidad no puede ser incremental”.
- Avoids predictable IDs and improves security.
- Supports distributed microservice environments.

**Consequences:**

- Requires UUID generation strategy (v4/v7).
- UUID indexing must be optimized (proper DB indexes).

---

## ADR-006 – Normalization: PostgreSQL data modeled to 3NF

**Decision:** All transactional PostgreSQL data is normalized to **Third Normal Form (3NF)**.

**Rationale:**

- Matches instructor requirement: “normalizar al menos hasta N3”.
- Reduces redundancy and update anomalies.
- Clear relationships for enrollment, tutoring booking, etc.

**Consequences:**

- Some queries require joins within a service database.
- Cross-service queries should use CQRS projections (search-service).

---

## ADR-007 – Datastore Strategy (3 DBs + Cache)

**Decision:** Use multiple datastores:

- **PostgreSQL**: transactional data (IAM, academic, enrollment, tutoring)
- **MongoDB**: audit logs and search projections (CQRS read model)
- **Redis**: cache, rate-limit counters, locking (booking concurrency)
- **S3**: file storage
- **Strapi DB**: content CMS storage (managed by Strapi)

**Rationale:**

- Meets rubric: “at least 3 DBs and one must be cache”.
- Each store is chosen by workload type.

**Consequences:**

- Requires clear ownership: Mongo projections are not source of truth.
- Operational complexity increases but is justified by rubric.

---

## ADR-008 – PaaS Requirement: Strapi as Headless CMS

**Decision:** Use **Strapi** as a **PaaS headless CMS** for educational materials (content management).  
The backend `material-service` acts as a secure proxy enforcing JWT/RBAC.

**Rationale:**

- Meets rubric: “Use AWS + any PaaS (Contentful, Strapi, Supabase…)”.
- Strapi fits the use case: materials, publish states, metadata.
- Reduces custom content admin development time.

**Consequences:**

- Content access must be secured (no public Strapi endpoints).
- Material rules belong to backend proxy.

---

## ADR-009 – API Gateway Pattern

**Decision:** All external clients access backend through a single **API Gateway** layer:

- REST endpoints (primary)
- GraphQL (search-oriented queries)
- WebSocket for real-time dashboard updates

**Rationale:**

- Meets rubric: “API Gateway”.
- Centralizes security policies (CORS, rate limiting, auth checks).
- Simplifies client integration.

**Consequences:**

- Gateway must remain thin; business logic stays inside services.
- Requires internal service discovery strategy.

---

## ADR-010 – Communication Methods (3+ + Mandatory Kafka/RabbitMQ/MQTT)

**Decision:** Use multiple communication methods:

- REST (external + some internal)
- gRPC (internal service-to-service, performance)
- GraphQL (query aggregation/search)
- WebSocket (real-time updates)
- Webhooks (integration with automation)
- **Kafka** (mandatory event bus)
- **RabbitMQ** (mandatory queues for notifications)
- **MQTT** (mandatory lightweight alerts)

**Rationale:**

- Meets rubric requirement (explicitly mandatory messaging technologies).
- Aligns with microservices and event-driven approach.

**Consequences:**

- Operational complexity; therefore use Docker Compose in QA and managed alternatives in PROD where possible.

---

## ADR-011 – Event-Driven Architecture + CQRS

**Decision:** Implement **Event-Driven Architecture** + **CQRS**:

- Commands: create enrollment, reserve tutoring, publish material
- Queries: search tutorings/materials via projections (search-service)

**Rationale:**

- Meets rubric: “Mandatory Microservices, Event Driven and CQRS”.
- Improves scalability and decouples read/write concerns.

**Consequences:**

- Requires event versioning and contracts.
- Search projections are eventually consistent.

---

## ADR-012 – Audit Integration via Events (No Tight Coupling)

**Decision:** Microservices do **not** call audit-service directly.  
Instead:

- Services publish domain events to Kafka.
- `audit-service` consumes events and writes to audit log.

**Rationale:**

- Matches instructor question: “todos los microservicios deberían pasar por auditoría?”
- Avoids coupling and single-point dependency.
- Ensures complete traceability.

**Consequences:**

- Must ensure events include correlation/request IDs.
- Audit is near-real-time and event-driven.

---

## ADR-013 – Security Model (RBAC + Defense-in-Depth)

**Decision:** Implement defense-in-depth security:

- JWT authentication (auth-service)
- RBAC roles/permissions (auth + gateway)
- CORS policy (gateway)
- Rate limiting (gateway + Redis)
- Cloudflare WAF + firewall rules (infra)
- Secure secrets management (AWS Secrets Manager or env injection)
- TLS everywhere (HTTPS)

**Rationale:**

- Meets rubric: Security (JWT, CORS, firewall, rate limit, etc.)
- Fits real-world best practices.

**Consequences:**

- Requires security testing and proper secret handling in CI/CD.
- Gateway enforces global policies; services enforce local policies.

---

## ADR-014 – Bastion / Jump Box for Infrastructure Access

**Decision:** Use a **Bastion Host (Jump Box)** for operational access to private infrastructure resources.  
No direct public access to backend EC2 instances or databases.

**Rationale:**

- Matches instructor requirement: “Todos BASTION con Jumpbox”.
- Improves security posture.

**Consequences:**

- SSH access requires bastion hopping.
- Must configure Security Groups and private subnets.

---

## ADR-015 – QA vs PROD Network Segmentation (Cross-account)

**Decision:** Maintain separate environments:

- QA VPC and PROD VPC are isolated
- Prefer cross-account separation (QA AWS account / PROD AWS account)

**Rationale:**

- Matches instructor note: “Cross Account, VPC segment QA y Produ”.
- Prevents accidental PROD impacts.

**Consequences:**

- Terraform must support multi-environment deployment.
- Requires environment-specific variables and state.

---

## ADR-016 – High Availability Strategy (PROD)

**Decision (PROD):**

- Load Balancer (ELB/ALB)
- Auto Scaling Groups (ASG)
- Stateless microservices
- Managed databases where possible

**Rationale:**

- Meets rubric: ELB + ASG and High Availability.

**Consequences:**

- Requires health checks and deployment strategy.
- QA can run simpler via Docker Compose.

---

## ADR-017 – Infrastructure as Code (Terraform)

**Decision:** Use **Terraform** for AWS infrastructure:

- VPC/Subnets
- Bastion
- EC2/ASG/ELB
- RDS (PostgreSQL)
- Redis (ElastiCache or container QA)
- API Gateway resources

**Rationale:**

- Meets rubric: Terraform.
- Reproducible environments.

**Consequences:**

- Requires consistent module structure and state management.

---

## ADR-018 – CI/CD Standardization (GitHub Actions)

**Decision:** Use **GitHub Actions** pipelines:

- Build
- Unit tests + integration tests
- Docker build + push (DockerHub/ECR/GHCR)
- Deploy (QA and PROD)

**Rationale:**

- Meets rubric: CI/CD and DevOps requirement.
- Provides evidence through workflow runs.

**Consequences:**

- Must maintain environment variables and secrets in GitHub.

---

## ADR-019 – Testing Strategy

**Decision:** Implement multiple testing levels:

- Unit tests (Jest)
- Integration tests (service-level)
- Functional tests (API)
- Load testing (k6)
  Testing runs in CI.

**Rationale:**

- Meets rubric: Load/Unit/Functional + “backend into CI/CD”.

**Consequences:**

- Requires minimal test harness and stable test data.

---

## ADR-020 – On-Premise Backup Integration

**Decision (PROD):**

- Periodic DB backups exported to a location treated as on-prem (simulated by a separate server or local VM).
- Use scripts (`backup-onprem.sh` / `restore.sh`) and optionally n8n workflows.

**Rationale:**

- Meets rubric: “Connect with an on-premise to do backups”.

**Consequences:**

- Must document and demonstrate the backup flow.
- Security for backup credentials is required.

---

## ADR-021 – Automation using n8n

**Decision:** Use **n8n** to automate business processes:

- Enrollment created → notify student + audit event
- Tutoring reserved → notify teacher/student + audit event
- Material published → notify enrolled students

**Rationale:**

- Meets rubric: “Uses n8n to automate business processes”.
- Provides demonstrable workflows.

**Consequences:**

- Requires webhook/event integration.
- Workflows must be exported and stored in repository.

---

## ADR-022 – Documentation & Engineering Standards

**Decision:** Enforce documentation and workflow standards:

- Swagger/OpenAPI for REST APIs
- Conventional Commits
- PR template + meaningful PRs
- README per service + root README
- Architecture docs (C4 diagrams + ADRs)

**Rationale:**

- Meets rubric: “Good documentation… Swagger, conventional commit, PR, readmes”.

**Consequences:**

- Requires disciplined commit messages and PR process even if solo.

---
