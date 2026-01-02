# NestJS GraphQL Template

Production-ready NestJS GraphQL API with schema-first approach, JWT authentication, and multi-target deployment.

## Architecture

```mermaid
graph TB
    subgraph Client["Clients"]
        WEB[Web/Mobile]
        PLAY[Playground]
    end

    subgraph API["NestJS GraphQL"]
        APOLLO[Apollo Server]
        GQL[GraphQL Engine]
        GUARD[GQL Guards]
        RESOLVER[Resolvers]
    end

    subgraph Data["Data Layer"]
        PRISMA[Prisma ORM]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    WEB --> APOLLO
    PLAY --> APOLLO
    APOLLO --> GQL --> GUARD --> RESOLVER
    RESOLVER --> PRISMA --> PG
    RESOLVER --> REDIS
```

## Request Flow

```mermaid
sequenceDiagram
    Client->>+Apollo: GraphQL Request
    Apollo->>Apollo: Parse Schema
    Apollo->>+Guard: Auth Check
    Guard->>Guard: Validate JWT
    Guard->>+Resolver: Execute
    Resolver->>+Service: Logic
    Service->>+DB: Query
    DB-->>-Service: Data
    Service-->>-Resolver: Result
    Resolver-->>-Apollo: Response
    Apollo-->>-Client: JSON
```

## Features

- **NestJS 11** + Node.js 22
- **GraphQL**: Apollo Server 5 (schema-first)
- **Auth**: JWT + OAuth2 (Google, GitHub)
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Security**: Helmet, rate limiting
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

GraphQL Playground: http://localhost:3000/graphql

## Project Structure

```
src/
├── config/              # Configuration
├── graphql/
│   └── schema.graphql   # Schema definition
├── modules/
│   ├── auth/            # Resolvers, guards, strategies
│   ├── health/          # Health resolver
│   └── prisma/          # Database service
├── common/              # Shared utilities
└── main.ts
```

## GraphQL Operations

### Queries

```graphql
# Health check
query { health }

# Current user (auth required)
query { me { id email name } }

# Get user by ID
query { user(id: "...") { id email } }
```

### Mutations

```graphql
# Register
mutation {
  register(input: { email: "...", password: "...", name: "..." }) {
    accessToken
    user { id email }
  }
}

# Login
mutation {
  login(input: { email: "...", password: "..." }) {
    accessToken
    refreshToken
  }
}

# Refresh tokens
mutation { refreshTokens { accessToken refreshToken } }

# Logout
mutation { logout }
```

## Authentication

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Apollo
    participant S as Service
    participant DB as Database

    C->>A: mutation { login }
    A->>S: Validate credentials
    S->>DB: Find user
    S->>S: Generate JWT (15m)
    S->>S: Generate Refresh (7d)
    S->>DB: Store refresh hash
    A-->>C: { accessToken, refreshToken }

    Note over C,DB: Authenticated request
    C->>A: query { me } + Bearer token
    A->>A: GqlAuthGuard validates
    A-->>C: User data
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
pnpm db:push        # Push schema
```

## Documentation

- [System Architecture](./docs/system-architecture.md)
- [Deployment Guide](./docs/deployment-guide.md)

## License

MIT
