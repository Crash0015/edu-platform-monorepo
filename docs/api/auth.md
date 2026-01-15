# Auth Service API (auth-service)

**Domain:** Identity & Access Management (IAM)  
**Service Name:** auth-service  
**API Version:** v1  
**Base Path:** /api/v1/auth  
**Architectures:** Microservices + Event-Driven (Kafka) + CQRS (command/query separation) + Layered/Hexagonal inside service  
**Data Stores:** Postgres (system of record via Prisma), Redis (rate limiting/cache), Kafka (event bus)  
**MFA:** TOTP (RFC 6238)  
**Institutional policy:** ONLY emails ending with @uce.edu.ec are allowed for login and password reset flows.

---

## 1) Purpose

auth-service is the authoritative service for authentication (login, refresh, logout), password lifecycle (forgot/reset), multi-factor authentication (TOTP), role-based access control (RBAC) and emitting domain events for other services (user-service, enrollment-service, notification-service, audit-service).

Other services must NOT store credentials, issue tokens, or manage MFA. They rely on JWT and events/contracts from this service.

---

## 2) Non-Negotiable Security Requirements

### 2.1 Institutional Email Only

Allowed: \*@uce.edu.ec  
Rejected: any other domain (400 validation error)  
Applies to: /login, /forgot-password, /reset-password (token valid only for institutional users)

### 2.2 Token Security

Passwords stored hashed (Argon2id or bcrypt).  
Refresh tokens stored hashed only.  
Password reset tokens stored hashed only.  
Optional server-side pepper stored in secrets manager.

### 2.3 JWT Model (Access + Refresh)

Access token short-lived (≈15m).  
Refresh token long-lived (7–30d) and rotated on every use.  
Rotation includes family/session id and reuse detection.  
Reuse triggers revocation of the entire family/session.

### 2.4 Rate Limiting (Redis)

Mandatory: POST /login, POST /refresh, POST /forgot-password  
Optional: POST /login/mfa

### 2.5 User Enumeration Protection

/forgot-password always returns 200 with a generic message.

### 2.6 CORS

Explicit allowlist by environment (QA/PROD).  
No wildcard in PROD.

### 2.7 Auditing

Structured logs with correlationId and actorUserId.  
Kafka events emitted with no sensitive payload.

---

## 3) Data Model (High-Level)

### Postgres (Prisma)

users (uuid, email, password_hash, status, created_at, updated_at)  
roles (uuid, name)  
user_roles (user_id, role_id)  
refresh_tokens (uuid, user_id, token_hash, family_id, issued_at, expires_at, revoked_at, replaced_by_token_id, ip, user_agent)  
password_reset_tokens (uuid, user_id, token_hash, issued_at, expires_at, used_at, ip, user_agent)  
mfa_secrets (uuid, user_id, secret_encrypted, enabled_at, disabled_at)

### Redis

Rate limit buckets, locks, optional temporary MFA tokens.

### Kafka

Auth domain events only. No secrets, tokens or passwords.

---

## 4) API Conventions

JSON only.  
UUID identifiers.  
X-Correlation-Id always present (generated if missing).  
Errors return a consistent shape.

Standard error example (inline):
error=BadRequest, message=Validation failed, details=[email must end with @uce.edu.ec], correlationId=uuid

Status codes:  
200 OK  
201 Created (rare in auth)  
400 Bad Request  
401 Unauthorized  
403 Forbidden  
429 Too Many Requests  
500 Internal Server Error

---

## 5) Endpoints

### POST /login

Authenticate with institutional email and password. Rate limited.

Request example:
email=student@uce.edu.ec, password=StrongPassword123!

Response (no MFA):
accessToken=jwt, refreshToken=jwt, expiresIn=900, tokenType=Bearer, mfaRequired=false

Response (MFA required):
mfaRequired=true, mfaToken=challenge-token, challengeExpiresIn=300

Errors: 400 invalid email/validation, 401 invalid credentials, 429 rate limit exceeded

### POST /login/mfa

Complete login using TOTP. Rate limited.

Request: mfaToken=challenge-token, code=123456  
Response: accessToken, refreshToken, expiresIn=900, tokenType=Bearer

### POST /refresh

Rotate refresh token and issue new tokens. Rate limited.

Request: refreshToken=jwt  
Response: new accessToken, new refreshToken, expiresIn=900

Reuse detection revokes entire family/session and emits auth.session.compromised.

### POST /logout

Request: refreshToken=jwt, revokeFamily=true  
Response: message=Logged out successfully

### POST /forgot-password

Rate limited. Must not reveal user existence.

Request: email=student@uce.edu.ec  
Response ALWAYS 200: message=If the email exists, a reset link will be sent.

### POST /reset-password

Request: token=reset-token, newPassword=NewStrongPassword123!  
Response: message=Password reset successful

### GET /me

Requires Bearer token.  
Response: id, email, roles, mfaEnabled, status

### POST /mfa/setup

Requires Bearer token.  
Response: secret, otpauthUrl, qrCodeDataUrl  
Secret stored encrypted. MFA not enabled until verified.

### POST /mfa/verify

Request: code=123456  
Response: message=MFA enabled successfully

### POST /mfa/disable

Request: password=CurrentPassword123!, code=123456  
Response: message=MFA disabled successfully

---

## 6) Password Policy

Minimum length 10–12.  
Uppercase, lowercase, number.  
Optional symbols.  
Deny common passwords.  
Throttle repeated failures via Redis.

---

## 7) Domain Events (Kafka)

Event types:
iam.user.logged_in  
iam.user.password_reset_requested  
iam.user.password_reset_completed

Event envelope fields:
event_id, event_type, event_version, occurred_at, producer, correlation_id, actor_user_id, payload

Never publish passwords, refresh tokens, reset tokens, MFA secrets or emails for non-existing users.

---

## 8) Integration Contracts

Other services verify JWT via shared key, enforce RBAC via roles claim, and do NOT call auth-service synchronously per request.

Password reset emails are triggered by iam.user.password_reset_requested → notification-service.

---

## 9) Observability

/health liveness  
/ready readiness (db/redis/kafka)  
/metrics optional  
Structured JSON logs with correlationId

---

## 10) QA vs PROD

Swagger enabled in local/QA.  
CORS differs per environment.  
Secrets via env/secret manager.  
Stricter rate limits in PROD.

---

## 11) Rubric Coverage

Covers backend framework, microservice, security, testing, Docker, design patterns, databases (Postgres, Redis, Kafka), REST + Kafka communication, microservices + EDA + CQRS, monitoring readiness and documentation.

---

## 12) Acceptance Criteria

All endpoints implemented.  
Prisma migrations used.  
Redis rate limiting active.  
Kafka events emitted.  
MFA works end-to-end.  
Refresh rotation with reuse detection implemented.  
Swagger complete and available in QA.  
Unit and e2e tests pass in CI.  
Docker image builds and runs locally.
