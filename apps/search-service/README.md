# Search Service

## Purpose
Consumes Kafka events and builds read projections in MongoDB.

## Architecture
- Layered structure: presentation, application, infrastructure, shared.

## Endpoints
- `GET /api/v1/search/enrollments/:studentId`
- `GET /health`
- `GET /ready`

## Events
- Consumes `enrollment.enrollment.created`

## Run Locally
1. `npm install`
2. `npm run start:dev`

## Tests
- `npm run test:unit`
