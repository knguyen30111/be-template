# NestJS REST API Template

Production-ready NestJS REST API with JWT authentication, Prisma ORM, and multi-target deployment.

## Architecture

```mermaid
graph TB
    subgraph Client["Clients"]
        WEB[Web/Mobile]
    end

    subgraph API["NestJS REST API"]
        MW[Middleware<br/>Helmet, CORS, Rate Limit]
        GUARD[JWT Guard]
        CTRL[Controllers]
        SVC[Services]
    end

    subgraph Data["Data Layer"]
        PRISMA[Prisma ORM]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    WEB --> MW --> GUARD --> CTRL --> SVC
    SVC --> PRISMA --> PG
    SVC --> REDIS
```

## Request Flow

```mermaid
sequenceDiagram
    Client->>+API: HTTP Request
    API->>API: Helmet/CORS
    API->>API: Rate Limit Check
    API->>API: JWT Validation
    API->>+Service: Business Logic
    Service->>+DB: Query
    DB-->>-Service: Data
    Service-->>-API: Response
    API-->>-Client: JSON
```

## Features

- **NestJS 11** + Node.js 22
- **Auth**: JWT + OAuth2 (Google, GitHub)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Security**: Helmet, CORS, rate limiting
- **Docs**: Swagger/OpenAPI
- **Testing**: Vitest + Supertest
- **Deploy**: Docker, K8s, Serverless, PM2

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm start:dev
```

API: http://localhost:3000/api/v1/
Swagger: http://localhost:3000/api/docs

## Project Structure

```
src/
├── common/           # Guards, decorators, interceptors
├── config/           # Zod-validated configuration
├── modules/
│   ├── auth/         # JWT + OAuth authentication
│   ├── health/       # Health endpoints
│   └── prisma/       # Database service
├── main.ts           # HTTP entry
└── lambda.ts         # Serverless entry
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/register | - | Register user |
| POST | /api/v1/auth/login | - | Login |
| POST | /api/v1/auth/refresh | JWT | Refresh tokens |
| POST | /api/v1/auth/logout | JWT | Logout |
| GET | /api/v1/auth/me | JWT | Current user |
| GET | /api/v1/auth/google | - | Google OAuth |
| GET | /api/v1/auth/github | - | GitHub OAuth |
| GET | /api/v1/health | - | Liveness |
| GET | /api/v1/health/ready | - | Readiness |

## Authentication

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth
    participant DB as Database

    C->>A: POST /auth/login
    A->>DB: Validate credentials
    A->>A: Generate JWT (15m)
    A->>A: Generate Refresh (7d)
    A->>DB: Store refresh hash
    A-->>C: { accessToken, refreshToken }

    Note over C,DB: Later...

    C->>A: POST /auth/refresh
    A->>DB: Validate refresh token
    A->>A: Generate new tokens
    A-->>C: { accessToken, refreshToken }
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
npx serverless deploy
```

### PM2

```bash
pnpm build && pm2 start pm2.ecosystem.config.js
```

## Scripts

```bash
pnpm start:dev     # Dev server
pnpm build         # Production build
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
```

## Documentation

- [System Architecture](./docs/system-architecture.md)
- [Deployment Guide](./docs/deployment-guide.md)

## License

MIT
