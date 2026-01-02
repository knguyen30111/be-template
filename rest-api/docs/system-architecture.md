# System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB[Web App]
        MOB[Mobile App]
        CLI[CLI/SDK]
    end

    subgraph Gateway["API Gateway Layer"]
        LB[Load Balancer]
        API[NestJS REST API]
    end

    subgraph Security["Security Layer"]
        HELMET[Helmet]
        CORS[CORS]
        THROTTLE[Rate Limiter]
        JWT[JWT Auth]
    end

    subgraph Services["Service Layer"]
        AUTH[Auth Service]
        HEALTH[Health Service]
        PRISMA[Prisma Service]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    WEB --> LB
    MOB --> LB
    CLI --> LB
    LB --> API

    API --> HELMET
    API --> CORS
    API --> THROTTLE
    API --> JWT

    JWT --> AUTH
    API --> HEALTH
    AUTH --> PRISMA
    HEALTH --> PRISMA

    PRISMA --> PG
    AUTH --> REDIS
```

## Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant H as Helmet/CORS
    participant T as Throttler
    participant G as JWT Guard
    participant CT as Controller
    participant S as Service
    participant P as Prisma
    participant DB as PostgreSQL

    C->>H: HTTP Request
    H->>T: Security headers applied
    T->>T: Check rate limit
    alt Rate limit exceeded
        T-->>C: 429 Too Many Requests
    end
    T->>G: Request allowed
    alt Protected route
        G->>G: Validate JWT
        alt Invalid token
            G-->>C: 401 Unauthorized
        end
    end
    G->>CT: Request authorized
    CT->>S: Business logic
    S->>P: Database query
    P->>DB: SQL
    DB-->>P: Result
    P-->>S: Entity
    S-->>CT: DTO
    CT-->>C: JSON Response
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Controller
    participant S as Auth Service
    participant P as Prisma
    participant R as Redis
    participant DB as PostgreSQL

    Note over C,DB: Registration Flow
    C->>A: POST /auth/register
    A->>S: register(dto)
    S->>S: Hash password (bcrypt)
    S->>P: Create user
    P->>DB: INSERT
    S->>S: Generate tokens
    S->>P: Store refresh token hash
    S-->>C: { accessToken, refreshToken, user }

    Note over C,DB: Login Flow
    C->>A: POST /auth/login
    A->>S: login(credentials)
    S->>P: Find user by email
    S->>S: Verify password
    S->>S: Generate tokens
    S->>P: Store refresh token hash
    S-->>C: { accessToken, refreshToken, user }

    Note over C,DB: Token Refresh
    C->>A: POST /auth/refresh
    A->>S: refreshTokens(token)
    S->>P: Find user by token
    S->>S: Verify refresh token
    S->>S: Generate new tokens
    S->>P: Update refresh token
    S-->>C: { accessToken, refreshToken }

    Note over C,DB: OAuth Flow (Google/GitHub)
    C->>A: GET /auth/google
    A-->>C: Redirect to Google
    C->>A: GET /auth/google/callback
    A->>S: validateOAuthUser
    S->>P: Find or create user
    S->>S: Generate tokens
    S-->>C: Redirect with tokens
```

## Database Schema

```mermaid
erDiagram
    USER {
        string id PK "CUID"
        string email UK "Unique"
        string password "Nullable (OAuth)"
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
    subgraph Core["Core Modules"]
        APP[AppModule]
        CONFIG[ConfigModule]
    end

    subgraph Features["Feature Modules"]
        AUTH[AuthModule]
        HEALTH[HealthModule]
        PRISMA[PrismaModule]
    end

    subgraph Guards["Global Guards"]
        JWT_G[JwtAuthGuard]
        THROTTLE_G[ThrottlerGuard]
    end

    subgraph Strategies["Passport Strategies"]
        LOCAL[LocalStrategy]
        JWT_S[JwtStrategy]
        REFRESH[JwtRefreshStrategy]
        GOOGLE[GoogleStrategy]
        GITHUB[GitHubStrategy]
    end

    APP --> CONFIG
    APP --> AUTH
    APP --> HEALTH
    APP --> PRISMA
    APP --> JWT_G
    APP --> THROTTLE_G

    AUTH --> LOCAL
    AUTH --> JWT_S
    AUTH --> REFRESH
    AUTH --> GOOGLE
    AUTH --> GITHUB
    AUTH --> PRISMA
```

## Deployment Architecture

```mermaid
graph TB
    subgraph Cloud["Cloud Provider"]
        subgraph K8s["Kubernetes Cluster"]
            ING[Ingress Controller]
            subgraph Pods["Application Pods"]
                POD1[API Pod 1]
                POD2[API Pod 2]
            end
            SVC[ClusterIP Service]
        end

        subgraph Managed["Managed Services"]
            RDS[(PostgreSQL)]
            ELASTICACHE[(Redis)]
        end
    end

    CLIENT[Client] --> ING
    ING --> SVC
    SVC --> POD1
    SVC --> POD2
    POD1 --> RDS
    POD2 --> RDS
    POD1 --> ELASTICACHE
    POD2 --> ELASTICACHE
```

## Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | NestJS 11 | Application framework |
| Runtime | Node.js 22 | JavaScript runtime |
| Database | PostgreSQL 17 | Primary data store |
| ORM | Prisma 6 | Database abstraction |
| Cache | Redis 7 | Session & cache store |
| Auth | Passport.js | Authentication strategies |
| Tokens | JWT | Access & refresh tokens |
| Hashing | bcrypt | Password hashing |
| Validation | class-validator | DTO validation |
| Config | Zod | Environment validation |
| Docs | Swagger | API documentation |
| Testing | Vitest | Unit & E2E tests |

## Security Layers

1. **Helmet** - HTTP security headers
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - 100 req/60s per IP
4. **JWT Auth** - Bearer token authentication
5. **bcrypt** - Password hashing (10 rounds)
6. **Validation** - Input sanitization
