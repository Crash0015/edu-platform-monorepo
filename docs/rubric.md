# Rubric Compliance – Educational Platform (Master Checklist)

This document maps the project implementation to the 21 rubric requirements.
Each item includes:

- What it means
- Where it is implemented in the repo
- Evidence to capture (screenshots/video)

---

## 1) Monorepo

**Goal:** Single repository hosting multiple services and shared packages.  
**Where:** repo root, apps/, packages/  
**Evidence:** repo tree + README.

---

## 2) Language & Framework

**Goal:** Backend implemented with a modern framework.  
**Decision:** NestJS (TypeScript).  
**Where:** apps/\* services  
**Evidence:** running service + swagger.

---

## 3) Multi-platform (Web / Mobile / Desktop) + Roles

**Goal:** Platform supports multiple clients + RBAC.  
**Where:** frontend/ (web), future mobile/desktop scaffolding, auth-service RBAC  
**Evidence:** login as TEACHER vs STUDENT and show different permissions.

---

## 4) At least 10 Microservices

**Goal:** Minimum 10 services (can be minimal but real boundaries).  
**Where:** apps/  
**Evidence:** list of services + docker compose / deployment proof.

---

## 5) Security (bastion/jump box, CORS, firewall, Cloudflare, rate limit, JWT, etc.)

**Where:** infra/terraform, docs/security, api-gateway config, auth-service JWT + rate limit  
**Evidence:** screenshots of SG rules, Cloudflare settings, rate-limit test.

---

## 6) Use AWS + any PaaS (Strapi/Supabase/etc.)

**Where:** infra/terraform, docs/deployment, Strapi deployment plan  
**Evidence:** PaaS dashboard + AWS resources.

---

## 7) DevOps CI/CD (GitHub Actions)

**Where:** .github/workflows, ci/  
**Evidence:** successful pipeline runs + artifacts.

---

## 8) Testing (Unit, Functional, Load) in CI/CD

**Where:** apps/\*/test, ci pipelines  
**Evidence:** test reports + k6/artillery run output.

---

## 9) Docker Registry (DockerHub/GHCR)

**Where:** Dockerfiles + workflow push  
**Evidence:** registry images list.

---

## 10) Design Principles (at least 4: SOLID/DRY/KISS/YAGNI/etc.)

**Where:** docs/architecture/decisions.md + code structure (modules, services, repos)  
**Evidence:** short explanation + code example.

---

## 11) Databases (at least 3, one cache)

**Decision:** Postgres + MongoDB + Redis (cache) + Strapi (content)  
**Where:** infra/docker, infra/terraform, docs/architecture/data-model.md  
**Evidence:** running containers + AWS managed equivalents.

---

## 12) ELB + ASG

**Where:** infra/terraform  
**Evidence:** AWS console screenshots + terraform apply output.

---

## 13) Terraform

**Where:** infra/terraform  
**Evidence:** terraform plan/apply + state management.

---

## 14) API Gateway

**Where:** infra/terraform or infra/gateway  
**Evidence:** routes working + auth integration.

---

## 15) 3+ Communication Methods (REST + others) + Mandatory Kafka, RabbitMQ, MQTT

**Decision:** REST + gRPC + Webhooks (or GraphQL) + Kafka + RabbitMQ + MQTT  
**Where:** docs/architecture/decisions.md, docs/architecture/event-catalog.md, service implementations  
**Evidence:** demo calls and broker screenshots.

---

## 16) Architectures (at least 2) + Mandatory Microservices, EDA, CQRS

**Decision:** Microservices + EDA + CQRS + (Hexagonal or Layered inside services)  
**Where:** docs/architecture/decisions.md, code structure  
**Evidence:** diagram + repo structure.

---

## 17) Monitoring & Alerting (Prometheus + Grafana)

**Where:** monitoring/  
**Evidence:** dashboards + alert rule triggered.

---

## 18) High Availability

**Where:** infra/terraform + multi-AZ or redundancy pattern  
**Evidence:** architecture diagram + deployed resources.

---

## 19) On-premise integration for backups

**Where:** docs/deployment + backup scripts or job definition  
**Evidence:** backup job run + stored backup artifact.

---

## 20) n8n Automation

**Where:** apps/automation-service or workflows/ + docs  
**Evidence:** n8n workflow screenshot + triggered by event.

---

## 21) Documentation (Swagger, conventional commits, PRs, README)

**Where:** swagger in services, conventional-commits.md, README.md  
**Evidence:** swagger UI + commit history + PR screenshots.

---
