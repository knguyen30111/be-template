# NestJS Templates

Production-ready NestJS 11 templates for rapid project scaffolding.

## Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| [`rest-api/`](./rest-api/) | REST API with Swagger | Traditional REST APIs |
| [`graphql/`](./graphql/) | Schema-first GraphQL | GraphQL-only APIs |
| [`hybrid/`](./hybrid/) | REST + GraphQL combined | APIs serving both REST and GraphQL |
| [`microservices/`](./microservices/) | Kafka-based microservices | Distributed systems |

## Quick Start

```bash
# Clone this repo
git clone git@github.com:knguyen30111/be-template.git

# Copy the template you need
cp -r be-template/rest-api my-new-project
cd my-new-project

# Install & run
pnpm install
cp .env.example .env
pnpm db:generate
pnpm start:dev
```

## Tech Stack (All Templates)

- **Framework**: NestJS 11 + Node.js 22
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + OAuth2 (Google, GitHub)
- **Caching**: Redis via @nestjs/cache-manager
- **Queues**: BullMQ
- **Testing**: Vitest + Supertest
- **Deployment**: Docker, Kubernetes, Google Cloud Functions, PM2

## Template Features

### REST API (`rest-api/`)
- Swagger/OpenAPI documentation
- Standard controller/service pattern
- Auth + Health modules

### GraphQL (`graphql/`)
- Schema-first with Apollo Server
- GraphQL Playground
- Resolver pattern with GQL guards

### Hybrid (`hybrid/`)
- Both REST endpoints AND GraphQL resolvers
- Swagger + GraphQL Playground
- Shared services between REST/GraphQL

### Microservices (`microservices/`)
- Kafka transport layer
- Gateway + User Service + Notification Service
- Per-service Docker & K8s configs
- NestJS monorepo structure

## Deployment Options

Each template includes configs for:
- **Docker**: `docker/Dockerfile`, `docker-compose.yml`
- **Kubernetes**: `k8s/` manifests
- **Serverless**: `serverless.yml` (Google Cloud Functions)
- **VPS**: `pm2.ecosystem.config.js`

## License

MIT
