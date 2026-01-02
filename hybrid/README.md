# NestJS Hybrid Template

Production-ready NestJS Hybrid API combining REST and GraphQL with shared services.

## Architecture

```mermaid
graph TB
    subgraph Client["Clients"]
        REST_C[REST Clients]
        GQL_C[GraphQL Clients]
    end

    subgraph API["NestJS Hybrid"]
        direction LR
        subgraph REST["REST"]
            CTRL[Controllers]
            SWAGGER[Swagger]
        end
        subgraph GQL["GraphQL"]
            APOLLO[Apollo]
            RESOLVER[Resolvers]
        end
    end

    subgraph Services["Shared Services"]
        AUTH[Auth Service]
        HEALTH[Health Service]
    end

    subgraph Data["Data Layer"]
        PRISMA[Prisma]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    REST_C --> CTRL
    GQL_C --> APOLLO
    CTRL --> AUTH
    RESOLVER --> AUTH
    AUTH --> PRISMA --> PG
    AUTH --> REDIS
```

## Request Flows

```mermaid
sequenceDiagram
    participant RC as REST Client
    participant GC as GraphQL Client
    participant API as NestJS
    participant S as Shared Service
    participant DB as Database

    par REST Request
        RC->>API: POST /api/auth/login
        API->>S: login()
        S->>DB: Query
        API-->>RC: JSON
    and GraphQL Request
        GC->>API: mutation { login }
        API->>S: login()
        S->>DB: Query
        API-->>GC: GraphQL Response
    end
```

## Features

- **NestJS 11** + Node.js 22
- **Hybrid**: REST + GraphQL (schema-first)
- **Auth**: JWT + OAuth2 (Google, GitHub)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Docs**: Swagger + GraphQL Playground
- **Testing**: Vitest + Supertest
- **Deploy**: Docker, K8s, Serverless, PM2

## Quick Start

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres redis
pnpm db:push
pnpm start:dev
```

### Endpoints

- **REST API**: http://localhost:3000/api/v1/
- **Swagger**: http://localhost:3000/api/docs
- **GraphQL**: http://localhost:3000/graphql

## Project Structure

```
src/
├── config/              # Configuration
├── graphql/
│   └── schema.graphql   # GraphQL schema
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts  # REST
│   │   ├── auth.resolver.ts    # GraphQL
│   │   └── auth.service.ts     # Shared
│   ├── health/          # Health checks
│   └── prisma/          # Database
├── common/              # Guards, decorators
└── main.ts
```

## REST Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | - | Register |
| POST | /api/v1/auth/login | - | Login |
| POST | /api/v1/auth/refresh | JWT | Refresh |
| POST | /api/v1/auth/logout | JWT | Logout |
| GET | /api/v1/auth/me | JWT | Current user |
| GET | /api/v1/health | - | Health check |

## GraphQL Operations

```graphql
# Mutations
mutation { register(input: {...}) { accessToken user { id } } }
mutation { login(input: {...}) { accessToken refreshToken } }
mutation { refreshTokens { accessToken refreshToken } }
mutation { logout }

# Queries
query { me { id email name } }
query { user(id: "...") { id email } }
query { health }
```

## Shared Service Pattern

```mermaid
graph LR
    subgraph Endpoints
        REST[Controller]
        GQL[Resolver]
    end

    subgraph Shared
        SVC[Auth Service]
    end

    REST --> SVC
    GQL --> SVC
```

Both REST and GraphQL share the same service layer for:
- Authentication logic
- Token generation
- Password hashing
- User management

## Authentication

```mermaid
sequenceDiagram
    participant C as Client
    participant E as REST/GraphQL
    participant S as Auth Service
    participant DB as Database

    C->>E: Login (REST or GQL)
    E->>S: login(credentials)
    S->>DB: Find user
    S->>S: Verify password
    S->>S: Generate JWT (15m)
    S->>S: Generate Refresh (7d)
    S->>DB: Store refresh hash
    E-->>C: { accessToken, refreshToken }
```

## Database Schema

```mermaid
erDiagram
    USER {
        string id PK
        string email UK
        string password
        string name
        enum role
        enum provider
        string providerId
        string refreshToken
        datetime createdAt
        datetime updatedAt
    }
```

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile -t api .
docker compose up -d
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

### Serverless

```bash
npx serverless deploy --stage prod
```

### PM2

```bash
pnpm build && pm2 start pm2.ecosystem.config.js
```

## Scripts

```bash
pnpm start:dev      # Dev server
pnpm build          # Production build
pnpm test           # Tests
pnpm db:generate    # Generate Prisma
pnpm db:migrate     # Run migrations
```

## Documentation

- [System Architecture](./docs/system-architecture.md)
- [Deployment Guide](./docs/deployment-guide.md)

## License

MIT
