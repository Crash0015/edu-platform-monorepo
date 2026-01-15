# Data Model (Logical) – Educational Platform

**Goal:** Define a complete, normalized (3NF) logical data model aligned to the platform domains and microservices.  
**Key Rules:**

- All primary keys are **UUID** (no incremental identifiers).
- Transactional domains use **PostgreSQL** (normalized to **3NF**).
- Cache uses **Redis** (no long-term truth stored there).
- Content uses **Strapi (PaaS)** + AWS S3 for assets.
- Cross-microservice linking uses UUID references and **events (Kafka)**, avoiding direct DB coupling.
- Services do **not** join across databases at runtime; they exchange IDs and events.

---

## 1) Global Conventions

### 1.1 UUID standard

- `id UUID PRIMARY KEY`
- Generate using UUIDv4/v7 (implementation detail).
- Never expose incremental IDs.

### 1.2 Audit fields (common)

For transactional tables (PostgreSQL), include:

- `created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
- `updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`
- `created_by UUID NULL` (actor user id; nullable for system)
- `updated_by UUID NULL`

### 1.3 Soft delete (optional but recommended)

- `is_deleted BOOLEAN NOT NULL DEFAULT FALSE`
- `deleted_at TIMESTAMP WITH TIME ZONE NULL`

### 1.4 Status enums (recommended pattern)

Prefer constrained values (enum in app, check constraint in DB).
Examples:

- User status: `ACTIVE | SUSPENDED`
- Enrollment: `ACTIVE | DROPPED`
- Course: `ACTIVE | INACTIVE`

### 1.5 Indexing conventions

- All FK columns indexed.
- Unique constraints for business keys (email, code, natural uniqueness).
- Composite unique for join tables.
- For time-based queries: index `created_at`, `expires_at` where relevant.

---

## 2) Identity & Access (IAM) – PostgreSQL

> **Ownership split (recommended):**
>
> - **auth-service** owns: authentication, sessions/refresh tokens, password reset tokens, token rotation, login auditing.
> - **user-service** owns: user profile data beyond auth (optional).  
>   In MVP you can keep all IAM tables in auth-service for speed, but define ownership explicitly for later split.

### 2.1 users

- `id UUID PK`
- `email VARCHAR(255) UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `status VARCHAR(20) NOT NULL` (ACTIVE, SUSPENDED)
- `full_name VARCHAR(150) NOT NULL`
- `user_type VARCHAR(20) NOT NULL` (TEACHER, STUDENT, ADMIN)
- `last_login_at TIMESTAMPTZ NULL`
- audit fields
- soft delete (optional)

**Notes:**

- Students are created only by teachers/admin (no self-registration).
- Password recovery handled via tokens.
- Email uniqueness is case-insensitive in practice (implement normalization at application level).

**Indexes:**

- Unique index on `email`
- Index on `status`, `user_type` (optional)

### 2.2 roles

- `id UUID PK`
- `name VARCHAR(50) UNIQUE NOT NULL` (TEACHER, STUDENT, ADMIN)
- `description TEXT NULL`

### 2.3 permissions (optional but helps rubric)

- `id UUID PK`
- `name VARCHAR(80) UNIQUE NOT NULL` (COURSE_CREATE, MATERIAL_PUBLISH, etc.)
- `description TEXT NULL`

### 2.4 user_roles (M:N)

- `user_id UUID FK -> users.id`
- `role_id UUID FK -> roles.id`
- PK: (`user_id`, `role_id`)

**Indexes:**

- Index on `role_id`
- Index on `user_id`

### 2.5 role_permissions (M:N)

- `role_id UUID FK -> roles.id`
- `permission_id UUID FK -> permissions.id`
- PK: (`role_id`, `permission_id`)

### 2.6 password_reset_tokens

- `id UUID PK`
- `user_id UUID FK -> users.id`
- `token_hash TEXT NOT NULL` (NEVER store raw token)
- `expires_at TIMESTAMPTZ NOT NULL`
- `used_at TIMESTAMPTZ NULL`
- `requested_ip TEXT NULL`
- `requested_user_agent TEXT NULL`
- audit fields

**Constraints:**

- `expires_at > created_at`
- At most one active token per user (optional business rule):
  - unique partial index: `(user_id) WHERE used_at IS NULL AND expires_at > now()`

### 2.7 refresh_tokens (Sessions) ✅ **(CRITICAL for real refresh flow)**

> Enables refresh rotation + revoke in DB.  
> **Do not store raw refresh token**, only a hash.

- `id UUID PK`
- `user_id UUID FK -> users.id`
- `token_hash TEXT NOT NULL UNIQUE`
- `expires_at TIMESTAMPTZ NOT NULL`
- `revoked_at TIMESTAMPTZ NULL`
- `replaced_by_token_id UUID NULL` (FK -> refresh_tokens.id) _(optional for rotation chain)_
- `created_ip TEXT NULL`
- `created_user_agent TEXT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`

**Rotation rule (logical):**

- On refresh, revoke old token (set `revoked_at`), create new token row, link old -> new with `replaced_by_token_id`.

**Indexes:**

- Index on `user_id`
- Index on `expires_at`
- Unique on `token_hash`

### 2.8 login_attempts (optional but recommended for security & rate limiting)

> Useful for brute-force protection evidence.

- `id UUID PK`
- `email VARCHAR(255) NOT NULL`
- `success BOOLEAN NOT NULL`
- `ip TEXT NULL`
- `user_agent TEXT NULL`
- `attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `failure_reason VARCHAR(60) NULL` (BAD_PASSWORD, USER_SUSPENDED, etc.)

**Indexes:**

- Index on `email`, `attempted_at`
- Index on `ip`, `attempted_at`

### 2.9 service_identities (optional for internal calls / gateway)

> If later you need service-to-service auth (mTLS or signed JWT).

- `id UUID PK`
- `service_name VARCHAR(80) UNIQUE NOT NULL`
- `api_key_hash TEXT NOT NULL`
- `status VARCHAR(20) NOT NULL` (ACTIVE, REVOKED)
- audit fields

**3NF rationale:** roles & permissions separated; sessions/tokens separated from users; avoids duplication and supports RBAC.

---

## 3) Academic Management – PostgreSQL

> Implemented by course-service.

### 3.1 academic_periods (optional)

- `id UUID PK`
- `name VARCHAR(50) NOT NULL` (e.g., 2026-A)
- `start_date DATE NOT NULL`
- `end_date DATE NOT NULL`

### 3.2 courses

- `id UUID PK`
- `code VARCHAR(30) UNIQUE NOT NULL`
- `name VARCHAR(120) NOT NULL`
- `description TEXT NULL`
- `period_id UUID NULL FK -> academic_periods.id`
- `status VARCHAR(20) NOT NULL` (ACTIVE, INACTIVE)
- audit fields
- soft delete (optional)

### 3.3 teacher_courses (M:N teacher-course)

- `id UUID PK`
- `teacher_id UUID NOT NULL` (references users.id with TEACHER type)
- `course_id UUID NOT NULL FK -> courses.id`
- `role_in_course VARCHAR(20) NOT NULL` (OWNER, ASSISTANT) optional
- UNIQUE (`teacher_id`, `course_id`)
- audit fields

**3NF rationale:** course data not duplicated per teacher; relationship normalized.

---

## 4) Enrollment – PostgreSQL

> Implemented by enrollment-service.

### 4.1 enrollments

- `id UUID PK`
- `student_id UUID NOT NULL` (references users.id with STUDENT type)
- `course_id UUID NOT NULL` (course-service identity)
- `status VARCHAR(20) NOT NULL` (ACTIVE, DROPPED)
- `enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- UNIQUE (`student_id`, `course_id`)
- audit fields

**Important:** `course_id` is a UUID reference; no runtime cross-DB joins.

---

## 5) Tutoring – PostgreSQL

> Implemented by schedule-service and tutoring-service.

### 5.1 schedule-service: availability_slots

- `id UUID PK`
- `teacher_id UUID NOT NULL`
- `course_id UUID NULL` (optional: slot tied to a course)
- `start_time TIMESTAMPTZ NOT NULL`
- `end_time TIMESTAMPTZ NOT NULL`
- `timezone VARCHAR(60) NOT NULL` (e.g., America/Guayaquil)
- `status VARCHAR(20) NOT NULL` (AVAILABLE, BLOCKED)
- audit fields

**Constraints (logical):**

- `end_time > start_time`
- No overlaps for same teacher when status=AVAILABLE (enforce via app + constraint approach)

### 5.2 tutoring-service: tutoring_sessions

- `id UUID PK`
- `teacher_id UUID NOT NULL`
- `course_id UUID NOT NULL`
- `availability_slot_id UUID NOT NULL`
- `mode VARCHAR(20) NOT NULL` (ONLINE, IN_PERSON)
- `location TEXT NULL`
- `meeting_url TEXT NULL`
- `status VARCHAR(20) NOT NULL` (OPEN, RESERVED, CANCELLED, DONE)
- audit fields

### 5.3 tutoring-service: bookings

- `id UUID PK`
- `tutoring_session_id UUID NOT NULL`
- `student_id UUID NOT NULL`
- `status VARCHAR(20) NOT NULL` (PENDING, CONFIRMED, CANCELLED)
- `reserved_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- UNIQUE (`tutoring_session_id`)
- audit fields

**Concurrency rule:** reservation must be atomic using DB unique constraint + transaction OR Redis lock.

---

## 6) Content & Materials – Strapi (PaaS) + AWS S3

> Implemented by Strapi + material-service as a proxy.

### 6.1 Strapi Content Types (logical)

**Material**

- `id` (Strapi internal)
- `course_id UUID` (reference to course)
- `teacher_id UUID`
- `title`
- `description`
- `type` (PDF, LINK, VIDEO)
- `status` (DRAFT, PUBLISHED)
- `published_at`
- `created_at`, `updated_at`

**MaterialAsset**

- File stored in S3 OR link URL
- `material_id`
- `asset_type` (FILE, LINK)
- `url`
- `metadata`

**Access Control**

- Strapi endpoints are not public.
- material-service enforces JWT + RBAC.

---

## 7) Search – MongoDB (or search optimized)

> Implemented by search-service; data is a projection of events (CQRS).

### 7.1 search_index_documents

A denormalized projection built from events:

- `id` (UUID or internal)
- `entity_type` (MATERIAL, TUTORING, COURSE, USER)
- `entity_id` (UUID)
- `payload` (json)
- `updated_at`

**Note:** Not system of record; query projection only.

---

## 8) Notifications – MongoDB or PostgreSQL (light)

> Implemented by notification-service.

### 8.1 notification_outbox (optional)

- `id UUID PK`
- `event_type`
- `payload`
- `status` (PENDING, SENT, FAILED)
- timestamps

**Channels:**

- RabbitMQ for queued processing
- MQTT for lightweight alerts

---

## 9) Audit – MongoDB (recommended)

> Implemented by audit-service.

### 9.1 audit_events (append-only)

- `id UUID`
- `event_type` (USER_CREATED, ENROLLMENT_CREATED, MATERIAL_PUBLISHED, etc.)
- `actor_user_id UUID NULL`
- `entity_type`
- `entity_id UUID`
- `timestamp`
- `metadata` (ip, user-agent, correlation-id, request-id)
- `payload` (json)

**Integration:**

- audit-service consumes events from Kafka.
- Microservices do not call audit-service directly (low coupling).

---

## 10) Redis (Cache)

> Used by multiple services.

### 10.1 Use cases

- rate limit counters
- tutoring booking lock keys
- caching hot data (courses, profiles)
- optional: JWT jti blacklist (only if required)

**Key conventions (examples):**

- `rl:{ip}:{route}`
- `lock:tutoring:{tutoring_session_id}`
- `cache:course:{course_id}`

Redis is not a source of truth; TTL enforced.

---

## 11) Event Model (Kafka Topics) – system integration

Events are produced by microservices and consumed by:

- audit-service
- notification-service
- automation-service (n8n)
- search-service (CQRS projections)

**Core events (examples):**

- USER_CREATED
- USER_LOGGED_IN
- PASSWORD_RESET_REQUESTED
- PASSWORD_RESET_COMPLETED
- COURSE_CREATED
- ENROLLMENT_CREATED
- MATERIAL_PUBLISHED
- AVAILABILITY_CREATED
- TUTORING_RESERVED
- BOOKING_CANCELLED

---

## 12) Reliability Pattern (Recommended): Outbox (Transactional Events)

> Optional but highly recommended for production-grade event publishing.

### 12.1 outbox_events (per service DB)

- `id UUID PK`
- `aggregate_type VARCHAR(60)` (USER, ENROLLMENT, etc.)
- `aggregate_id UUID`
- `event_type VARCHAR(80)`
- `event_version INT`
- `payload JSONB`
- `status VARCHAR(20)` (PENDING, SENT, FAILED)
- `attempts INT NOT NULL DEFAULT 0`
- `last_error TEXT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`
- `sent_at TIMESTAMPTZ NULL`

**Usage:** service writes business transaction + outbox row in same DB transaction; a worker publishes to Kafka.

---

## 13) Normalization Notes (3NF compliance)

Transactional data in PostgreSQL is normalized:

- No repeated groups
- Many-to-many tables used where needed
- Non-key attributes depend only on keys
- Join tables store relationships, not duplicated attributes

---

## 14) Summary of Datastores (Rubric compliance)

- PostgreSQL: IAM, Academic, Enrollment, Tutoring (+ Outbox per service)
- MongoDB: Audit logs, Search projections
- Redis: Cache / locks / rate limiting
- Strapi: Content PaaS
- S3: Files
