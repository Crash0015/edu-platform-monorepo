# CI/CD Workflows

## Required GitHub Secrets
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Workflows

### `ci.yml`
Runs on every push and pull request:
- Install dependencies
- Run unit tests
- Run auth-service e2e tests

### `docker-publish.yml`
Runs on push to `main`:
- Build Docker images for services that include a `Dockerfile`
- Push images to DockerHub
- Tags:
  - `latest`
  - `sha-<shortsha>`

## How to Trigger
- Push to any branch → `ci.yml`
- Open a PR → `ci.yml`
- Push to `main` → `docker-publish.yml`
