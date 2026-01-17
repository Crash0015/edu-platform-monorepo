# Notification Service

## Purpose
Consumes RabbitMQ messages and handles notification delivery.

## Architecture
- Layered structure: presentation, application, infrastructure, shared.
- RabbitMQ integration via infrastructure adapters.

## Endpoints
- `POST /api/v1/notifications/email`
- `GET /health`
- `GET /ready`

## Messaging
- Queue: `notifications.email`

## Run Locally
1. `npm install`
2. `npm run start:dev`

## Tests
- `npm run test:unit`
