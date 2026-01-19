# AGENTS.md — Master Context & Strategic Roadmap

## 1. Project Identity

**Project:** EDU Platform Monorepo.
**Stack:** NestJS (Backend), Next.js (Frontend), Prisma (ORM), Postgres/Mongo/Redis.
**Goal:** Semester project complying with a strict **21-point Rubric**.

## 2. THE GOLDEN RULE (Source of Truth)

You must **ALWAYS** read and adhere to the existing documentation files.

- **Rubric:** `docs/rubric.md` (Checklist of 21 points).
- **Global Rules:** `docs/ai/PROJECT_RULES.md` (UUIDs, Email Policy, etc.).
- **Architecture:** `docs/architecture/*.md` (Decisions, Data Model, Events).
- **Coding Standards:** `.cursor/rules/*.mdc`.

---

## 3. UNIVERSAL STANDARDS (Mandatory for ALL 10 Services)

_Every microservice must implement these baselines:_

1.  **Structure:** Layered/Hexagonal (`presentation`, `application`, `domain`, `infrastructure`).
2.  **IDs:** **UUID** (v4) for all primary keys.
3.  **Docs:** **Swagger/OpenAPI** (`@ApiProperty`, `@ApiOperation`) exposed at `/api/docs`.
4.  **CI/CD:** `Dockerfile` (multi-stage) + GitHub Actions (`ci.yml`) for Build/Test/Push.
5.  **Testing:**
    - **Unit:** Jest (`.spec.ts`) for Application Logic.
    - **E2E:** Supertest (`test/app.e2e-spec.ts`) for Controllers.
6.  **Config:** Environment variables validation (Joi/Zod).

---

## 4. STRATEGIC DISTRIBUTION (Rubric Compliance Map)

_Do NOT implement all patterns in all services. Follow this assignment table:_

| Domain Service   | Architecture      | Design Pattern                                | Communication           | Database        | Special Feature |
| :--------------- | :---------------- | :-------------------------------------------- | :---------------------- | :-------------- | :-------------- |
| **Auth**         | Hexagonal         | **Strategy** (Passport), **Factory** (Events) | REST + **gRPC** + Kafka | Postgres, Redis | MFA, RBAC       |
| **Enrollment**   | **CQRS** (Strong) | **Command**, State                            | REST + Kafka            | Postgres        | Transactional   |
| **Course**       | Layered           | Builder                                       | REST + **GraphQL**      | Postgres, Mongo | Read-Heavy      |
| **Material**     | Layered           | **Factory Method** (Content Types)            | REST                    | Strapi (PaaS)   | CMS Proxy       |
| **Notification** | Event-Driven      | **Adapter** (Email/SMS)                       | **RabbitMQ** (Consumer) | -               | Async Jobs      |
| **Automation**   | Event-Driven      | **Observer**                                  | **MQTT** + Webhook      | -               | n8n Integration |
| **Schedule**     | Hexagonal         | Singleton (Config)                            | REST                    | Postgres        | Availability    |
| **Search**       | CQRS (Read)       | Repository                                    | Kafka (Consumer)        | **MongoDB**     | Projections     |
| **Tutoring**     | Layered           | Proxy                                         | REST                    | Postgres        | Booking         |
| **Gateway**      | MVC               | Facade                                        | REST + Proxy            | Redis           | Rate Limiting   |

---

## 5. TEST & DEVOPS STRATEGY (Rubric Points 7, 8, 9, 12, 13)

### 5.1 Testing Levels

- **Unit:** 80% coverage on Service classes.
- **Functional:** Happy path verification on Controllers.
- **Load Testing:** **k6** scripts in `tools/k6/<service>.js` (Target: 100 concurrent users).

### 5.2 CI/CD & Registry

- **Workflow:** `.github/workflows/ci.yml` runs on PR.
- **Registry:** Images pushed to **DockerHub** (`docker-publish.yml`) on merge to main.

### 5.3 Infrastructure

- **Local:** `docker-compose.yml` orchestrates Postgres, Mongo, Redis, Kafka, Zookeeper, RabbitMQ.
- **Cloud (AWS):** Terraform scripts in `infra/terraform/` (VPC, ECS, RDS).

---

## 6. EXECUTION INSTRUCTIONS FOR AGENTS

When asked to work on a specific service (e.g., "Implement Auth"):

1.  **Identify:** Look up the service in the **Table (Section 4)** to know its assigned patterns and protocols.
2.  **Context:** Read the specific contract in `docs/api/<service>.md`.
3.  **Generate:** Create the code following the **Universal Standards (Section 3)** AND the specific **Distribution (Section 4)**.
4.  **Verify:** Ensure `package.json` includes dependencies for the assigned protocol (e.g., `@nestjs/microservices` for Kafka/gRPC).
