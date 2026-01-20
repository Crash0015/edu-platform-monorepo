# Material Service

## Purpose
Proxy and secure access to educational materials stored in Strapi.

## Architecture
- Layered structure: presentation, application, domain, infrastructure, shared.
- Factory Method for material content types.

## Endpoints

### Materials
- `POST /api/v1/materials` - Create material (Teacher/Admin)
- `GET /api/v1/materials` - List materials
- `GET /api/v1/materials/:id` - Get material
- `PATCH /api/v1/materials/:id` - Update material (Teacher/Admin)
- `DELETE /api/v1/materials/:id` - Delete material (Teacher/Admin)
- `POST /api/v1/materials/:id/publish` - Publish material (Teacher/Admin)

### Health
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe

## Events
- `content.material.published`

## Integrations
- Strapi CMS (STRAPI_URL + STRAPI_API_TOKEN)

## Tests
- `npm run test:unit`
