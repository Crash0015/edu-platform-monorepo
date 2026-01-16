# API Gateway

## Purpose
Thin entry point that proxies selected routes to backend services.

## Architecture
- MVC / Layered: controller delegates to application service.

## Endpoints
- `GET /health`
- `GET /ready`
- `GET /gateway/auth/health` (proxy example)

## Run Locally
1. `npm install`
2. `npm run start:dev`

## Tests
- `npm run test:unit`
