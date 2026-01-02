# System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB[Web App]
        MOB[Mobile App]
        PLAYGROUND[GraphQL Playground]
    end

    subgraph Gateway["API Layer"]
        APOLLO[Apollo Server]
        GQL[GraphQL Engine]
    end

    subgraph Security["Security Layer"]
        HELMET[Helmet]
        THROTTLE[Rate Limiter]
        GQL_GUARD[GQL Auth Guard]
    end

    subgraph Resolvers["Resolver Layer"]
        AUTH_R[Auth Resolver]
        HEALTH_R[Health Resolver]
    end

    subgraph Services["Service Layer"]
        AUTH_S[Auth Service]
        PRISMA[Prisma Service]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    WEB --> APOLLO
    MOB --> APOLLO
    PLAYGROUND --> APOLLO

    APOLLO --> GQL
    GQL --> HELMET
    GQL --> THROTTLE
    GQL --> GQL_GUARD

    GQL_GUARD --> AUTH_R
    GQL_GUARD --> HEALTH_R

    AUTH_R --> AUTH_S
    HEALTH_R --> PRISMA
    AUTH_S --> PRISMA

    PRISMA --> PG
    AUTH_S --> REDIS
```

## GraphQL Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Apollo Server
    participant G as GQL Guard
    participant R as Resolver
    participant S as Service
    participant P as Prisma
    participant DB as PostgreSQL

    C->>A: GraphQL Query/Mutation
    A->>A: Parse & Validate Schema
    A->>G: Check Authentication
    alt @Public decorator
        G->>R: Allow without auth
    else Protected
        G->>G: Extract JWT from context
        alt Invalid token
            G-->>C: AuthenticationError
        end
        G->>R: Inject currentUser
    end
    R->>S: Execute business logic
    S->>P: Database operation
    P->>DB: SQL query
    DB-->>P: Result
    P-->>S: Entity
    S-->>R: Data
    R-->>A: Resolver response
    A-->>C: GraphQL Response
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Apollo
    participant R as Auth Resolver
    participant S as Auth Service
    participant P as Prisma
    participant DB as PostgreSQL

    Note over C,DB: Registration
    C->>A: mutation { register(input) }
    A->>R: register()
    R->>S: register(dto)
    S->>S: Hash password
    S->>P: Create user
    P->>DB: INSERT
    S->>S: Generate tokens
    S->>P: Store refresh hash
    S-->>C: { accessToken, refreshToken, user }

    Note over C,DB: Login
    C->>A: mutation { login(input) }
    A->>R: login()
    R->>S: login(credentials)
    S->>P: Find user
    S->>S: Verify password
    S->>S: Generate tokens
    S-->>C: { tokens, user }

    Note over C,DB: Authenticated Query
    C->>A: query { me } + Authorization header
    A->>R: me() with context
    R->>R: @UseGuards(GqlAuthGuard)
    R->>R: @CurrentUser() decorator
    R-->>C: User data
```

## Schema-First Architecture

```mermaid
graph LR
    subgraph Schema["Schema Definition"]
        SDL[schema.graphql]
    end

    subgraph Generated["Auto-Generated"]
        TYPES[TypeScript Types]
    end

    subgraph Implementation["Implementation"]
        RESOLVERS[Resolvers]
        GUARDS[Guards]
    end

    SDL --> TYPES
    TYPES --> RESOLVERS
    RESOLVERS --> GUARDS
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

    subgraph Features["Features"]
        AUTH[AuthModule]
        HEALTH[HealthModule]
        PRISMA[PrismaModule]
    end

    subgraph Guards["Guards"]
        GQL_AUTH[GqlAuthGuard]
        GQL_REFRESH[GqlRefreshGuard]
        GQL_THROTTLE[GqlThrottlerGuard]
    end

    subgraph Strategies["Strategies"]
        JWT[JwtStrategy]
        REFRESH[JwtRefreshStrategy]
        LOCAL[LocalStrategy]
        GOOGLE[GoogleStrategy]
        GITHUB[GitHubStrategy]
    end

    APP --> CONFIG
    APP --> GQL_MOD
    APP --> AUTH
    APP --> HEALTH
    APP --> PRISMA

    AUTH --> GQL_AUTH
    AUTH --> GQL_REFRESH
    AUTH --> JWT
    AUTH --> REFRESH
    AUTH --> LOCAL
    AUTH --> GOOGLE
    AUTH --> GITHUB
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

        subgraph Managed["Managed Services"]
            RDS[(PostgreSQL)]
            CACHE[(Redis)]
        end
    end

    CLIENT[Client] --> ING
    ING --> SVC
    SVC --> P1
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
| GraphQL | Apollo Server 5 | GraphQL engine |
| Schema | Schema-first | Type definitions |
| Runtime | Node.js 22 | JavaScript runtime |
| Database | PostgreSQL 17 | Primary data store |
| ORM | Prisma 6 | Database abstraction |
| Cache | Redis 7 | Session & cache |
| Auth | Passport.js | Authentication |
| Testing | Vitest | Unit & E2E tests |

## Security Layers

1. **Helmet** - HTTP security headers (CSP adjusted for Apollo)
2. **GqlThrottlerGuard** - GraphQL rate limiting
3. **GqlAuthGuard** - JWT authentication
4. **bcrypt** - Password hashing
5. **ValidationPipe** - Input validation
