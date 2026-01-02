# NestJS Microservices Template

Production-ready NestJS microservices template with Kafka messaging, JWT authentication, Prisma ORM, and Kubernetes deployment.

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────────┐
│   Client    │────▶│     Gateway     │────▶│    Kafka Broker      │
└─────────────┘     │   (REST API)    │     └──────────────────────┘
                    └─────────────────┘              │
                                                     ▼
                    ┌─────────────────┐     ┌──────────────────────┐
                    │  User Service   │◀────│  Notification Svc    │
                    │   (Prisma DB)   │     │     (Email/SMS)      │
                    └─────────────────┘     └──────────────────────┘
```

## Services

- **Gateway**: HTTP API entry point, JWT auth, request routing via Kafka
- **User Service**: User management, authentication, Prisma + PostgreSQL
- **Notification Service**: Email/SMS notifications via Kafka events

## Tech Stack

- NestJS 11 + Node.js 22
- Kafka (via kafkajs) for inter-service communication
- PostgreSQL + Prisma ORM
- Redis for caching
- JWT + Passport authentication
- Vitest + Supertest testing
- Docker + Kubernetes deployment

## Quick Start

```bash
# Clone template
git clone https://github.com/be-boiler/nestjs-microservices-template.git my-project
cd my-project

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start infrastructure
docker compose up -d postgres redis kafka zookeeper

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start all services (dev mode)
pnpm start:all
```

## Development

```bash
# Start individual services
pnpm start:gateway        # Gateway on http://localhost:3000
pnpm start:user-service   # User service (Kafka consumer)
pnpm start:notification-service  # Notification service (Kafka consumer)

# Run tests
pnpm test

# Lint & format
pnpm lint
pnpm format
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register new user |
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/refresh | Refresh tokens |
| GET | /api/v1/auth/profile | Get current user |
| GET | /health | Health check |

## Docker Deployment

```bash
# Build all services
docker compose build

# Start everything
docker compose up -d

# View logs
docker compose logs -f
```

## Kubernetes Deployment

```bash
# Apply namespace and configs
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# Create secrets (edit secrets.example.yaml first)
cp k8s/secrets.example.yaml k8s/secrets.yaml
# Edit k8s/secrets.yaml with real values
kubectl apply -f k8s/secrets.yaml

# Deploy services
kubectl apply -f k8s/gateway/
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/notification-service/
```

## Project Structure

```
├── apps/
│   ├── gateway/          # API Gateway (HTTP)
│   ├── user-service/     # User microservice
│   └── notification-service/  # Notification microservice
├── libs/
│   └── shared/           # Shared interfaces & constants
├── prisma/               # Database schema
├── docker/               # Dockerfiles per service
├── k8s/                  # Kubernetes manifests
└── docker-compose.yml    # Local development
```

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
