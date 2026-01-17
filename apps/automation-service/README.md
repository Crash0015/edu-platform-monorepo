# Automation Service

## Purpose
Publishes automation events to RabbitMQ and MQTT.

## Architecture
- Layered structure: presentation, application, infrastructure, shared.
- RabbitMQ + MQTT integration via infrastructure adapters.

## Endpoints
- `POST /api/v1/automation/queue`
- `POST /api/v1/automation/publish`
- `GET /health`
- `GET /ready`

## Messaging
- RabbitMQ queue: `automation.jobs`
- MQTT topic: `edu/automation/events`

## Run Locally
1. `npm install`
2. `npm run start:dev`

## Tests
- `npm run test:unit`
