# Notification Service Specification

## Scope
Consumes notification jobs from RabbitMQ and exposes a REST endpoint to enqueue jobs.

## API
See `docs/api/notification.md`.

## Integrations
- RabbitMQ queue: `notifications.email`

## Security
See `docs/security/notification.md`.
