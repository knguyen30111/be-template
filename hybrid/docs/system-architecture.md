# System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        REST_C[REST Clients]
        GQL_C[GraphQL Clients]
        PLAY[Playground]
    end

    subgraph API["Hybrid API Layer"]
        direction TB
        subgraph REST["REST Layer"]
            CTRL[Controllers]
            SWAGGER[Swagger Docs]
        end
        subgraph GraphQL["GraphQL Layer"]
            APOLLO[Apollo Server]
            RESOLVER[Resolvers]
        end
    end

    subgraph Security["Security Layer"]
        HELMET[Helmet]
        THROTTLE[Rate Limiter]
        JWT_G[JWT Guard]
        GQL_G[GQL Auth Guard]
    end

    subgraph Services["Shared Service Layer"]
        AUTH_S[Auth Service]
        HEALTH_S[Health Service]
        PRISMA[Prisma Service]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    REST_C --> CTRL
    GQL_C --> APOLLO
    PLAY --> APOLLO
    SWAGGER --> CTRL

    CTRL --> JWT_G
    APOLLO --> GQL_G

    JWT_G --> AUTH_S
    GQL_G --> AUTH_S
    CTRL --> HEALTH_S
    RESOLVER --> HEALTH_S

    AUTH_S --> PRISMA
    HEALTH_S --> PRISMA

    PRISMA --> PG
    AUTH_S --> REDIS
```

## Hybrid Request Flows

### REST Request Flow

```mermaid
sequenceDiagram
    participant C as REST Client
    participant H as Helmet/CORS
    participant T as Throttler
    participant G as JWT Guard
    participant CT as Controller
    participant S as Service
    participant P as Prisma
    participant DB as PostgreSQL

    C->>H: HTTP Request
    H->>T: Security headers
    T->>T: Rate limit check
    T->>G: Request allowed
    G->>G: Validate JWT
    G->>CT: Inject user
    CT->>S: Business logic
    S->>P: Query
    P->>DB: SQL
    DB-->>C: JSON Response
```

### GraphQL Request Flow

```mermaid
sequenceDiagram
    participant C as GraphQL Client
    participant A as Apollo Server
    participant G as GQL Guard
    participant R as Resolver
    participant S as Service
    participant P as Prisma
    participant DB as PostgreSQL

    C->>A: GraphQL Operation
    A->>A: Parse & validate
    A->>G: Check auth
    G->>G: Extract JWT from context
    G->>R: Inject currentUser
    R->>S: Business logic
    S->>P: Query
    P->>DB: SQL
    DB-->>C: GraphQL Response
```

## Shared Service Architecture

```mermaid
graph TB
    subgraph Endpoints["Dual Endpoints"]
        REST[REST Controller]
        GQL[GraphQL Resolver]
    end

    subgraph Shared["Shared Services"]
        AUTH[Auth Service]
        HEALTH[Health Service]
    end

    subgraph Guards["Guards"]
        JWT[JwtAuthGuard<br/>REST]
        GQL_AUTH[GqlAuthGuard<br/>GraphQL]
    end

    REST --> JWT --> AUTH
    GQL --> GQL_AUTH --> AUTH
    REST --> HEALTH
    GQL --> HEALTH

    style AUTH fill:#f9f,stroke:#333
    style HEALTH fill:#f9f,stroke:#333
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant R as REST/GraphQL
    participant S as Auth Service
    participant P as Prisma
    participant DB as PostgreSQL

    Note over C,DB: Register (REST or GraphQL)
    alt REST
        C->>R: POST /api/auth/register
    else GraphQL
        C->>R: mutation { register }
    end
    R->>S: register(dto)
    S->>S: Hash password
    S->>P: Create user
    P->>DB: INSERT
    S->>S: Generate tokens
    S->>P: Store refresh hash
    S-->>C: { accessToken, refreshToken, user }

    Note over C,DB: Login (REST or GraphQL)
    alt REST
        C->>R: POST /api/auth/login
    else GraphQL
        C->>R: mutation { login }
    end
    R->>S: login(credentials)
    S->>P: Find user
    S->>S: Verify password
    S->>S: Generate tokens
    S-->>C: { tokens, user }

    Note over C,DB: Authenticated Request
    alt REST
        C->>R: GET /api/auth/me + Bearer
    else GraphQL
        C->>R: query { me } + Bearer
    end
    R->>R: Guard validates token
    R-->>C: User data
```

## Database Schema

```mermaid
erDiagram
    USER {
        string id PK "CUID"
        string email UK "Unique"
        string password "Nullable"
        string name "Optional"
        enum role "USER | ADMIN"
        enum provider "LOCAL | GOOGLE | GITHUB"
        string providerId "OAuth ID"
        string refreshToken "Hashed"
        datetime createdAt
        datetime updatedAt
    }
```

## Module Dependencies

```mermaid
graph TB
    subgraph Core["Core"]
        APP[AppModule]
        CONFIG[ConfigModule]
        GQL_MOD[GraphQLModule]
    end

    subgraph Features["Feature Modules"]
        AUTH[AuthModule]
        HEALTH[HealthModule]
        PRISMA[PrismaModule]
    end

    subgraph REST_G["REST Guards"]
        JWT_AUTH[JwtAuthGuard]
        LOCAL[LocalAuthGuard]
        THROTTLE[ThrottlerGuard]
    end

    subgraph GQL_G["GQL Guards"]
        GQL_AUTH[GqlAuthGuard]
        GQL_REFRESH[GqlRefreshGuard]
        GQL_THROTTLE[GqlThrottlerGuard]
    end

    APP --> CONFIG
    APP --> GQL_MOD
    APP --> AUTH
    APP --> HEALTH
    APP --> PRISMA

    AUTH --> JWT_AUTH
    AUTH --> LOCAL
    AUTH --> GQL_AUTH
    AUTH --> GQL_REFRESH
```

## Deployment Architecture

```mermaid
graph TB
    subgraph Cloud["Cloud"]
        subgraph K8s["Kubernetes"]
            ING[Ingress]
            SVC[Service]
            subgraph Pods["Pods"]
                P1[API Pod 1]
                P2[API Pod 2]
            end
        end

        subgraph Managed["Managed"]
            RDS[(PostgreSQL)]
            CACHE[(Redis)]
        end
    end

    REST[REST Client] --> ING
    GQL[GraphQL Client] --> ING
    ING --> SVC --> P1
    SVC --> P2
    P1 --> RDS
    P2 --> RDS
    P1 --> CACHE
    P2 --> CACHE
```

## Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | NestJS 11 | Application framework |
| REST | Controllers | HTTP endpoints |
| GraphQL | Apollo Server 5 | GraphQL engine |
| Runtime | Node.js 22 | JavaScript runtime |
| Database | PostgreSQL 17 | Primary data store |
| ORM | Prisma 6 | Database abstraction |
| Cache | Redis 7 | Session & cache |
| Auth | Passport.js | Authentication |
| REST Docs | Swagger | API documentation |
| GQL Docs | Playground | GraphQL explorer |
| Testing | Vitest | Unit & E2E tests |

## Security Layers

1. **Helmet** - HTTP security headers
2. **CORS** - Cross-origin control
3. **ThrottlerGuard** - REST rate limiting
4. **GqlThrottlerGuard** - GraphQL rate limiting
5. **JwtAuthGuard** - REST JWT auth
6. **GqlAuthGuard** - GraphQL JWT auth
7. **bcrypt** - Password hashing
8. **ValidationPipe** - Input validation
