# System Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB[Web App]
        MOB[Mobile App]
        CLI[CLI/SDK]
    end

    subgraph Gateway["API Gateway"]
        GW[NestJS Gateway<br/>HTTP → Kafka]
        JWT[JWT Auth]
        THROTTLE[Rate Limiter]
        SWAGGER[Swagger Docs]
    end

    subgraph MessageBus["Message Bus"]
        KAFKA[Apache Kafka]
        ZK[Zookeeper]
    end

    subgraph Services["Microservices"]
        USER[User Service<br/>Kafka Consumer]
        NOTIF[Notification Service<br/>Kafka Consumer]
    end

    subgraph Data["Data Layer"]
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    WEB --> GW
    MOB --> GW
    CLI --> GW

    GW --> JWT
    GW --> THROTTLE
    GW --> SWAGGER

    GW <--> KAFKA
    KAFKA --> ZK

    KAFKA <--> USER
    KAFKA --> NOTIF

    USER --> PG
    GW --> REDIS
```

## Service Communication Patterns

### Request-Reply Pattern (User Service)

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Gateway
    participant K as Kafka
    participant U as User Service
    participant DB as PostgreSQL

    C->>G: POST /api/v1/auth/login
    G->>K: send('user.validate', data)
    K->>U: Message received
    U->>DB: Query user
    DB-->>U: User data
    U->>U: Validate password
    U->>K: Response
    K->>G: Reply received
    G->>G: Generate JWT
    G-->>C: { accessToken, refreshToken }
```

### Event-Driven Pattern (Notifications)

```mermaid
sequenceDiagram
    participant G as Gateway
    participant K as Kafka
    participant N as Notification Service

    Note over G,N: Fire-and-forget pattern
    G->>K: emit('notification.send.welcome', { userId, email })
    K->>N: Event received
    N->>N: Send welcome email
    Note over N: No response expected
```

## Kafka Topics

```mermaid
graph LR
    subgraph UserTopics["User Service Topics"]
        UR[user.register]
        UL[user.validate]
        UF[user.find]
        UU[user.update]
    end

    subgraph NotificationTopics["Notification Topics"]
        NE[notification.send.email]
        NW[notification.send.welcome]
        NP[notification.send.password-reset]
    end

    GW[Gateway] --> UR
    GW --> UL
    GW --> UF
    GW --> UU

    GW --> NE
    GW --> NW
    GW --> NP
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant G as Gateway
    participant K as Kafka
    participant U as User Service
    participant DB as PostgreSQL

    Note over C,DB: Registration
    C->>G: POST /api/v1/auth/register
    G->>K: send('user.register', data)
    K->>U: Message
    U->>U: Hash password (bcrypt)
    U->>DB: Create user
    U->>K: Response (user data)
    K->>G: Reply
    G->>G: Generate access token (15m)
    G->>G: Generate refresh token (7d)
    G->>K: emit('notification.send.welcome')
    G-->>C: { accessToken, refreshToken, user }

    Note over C,DB: Login
    C->>G: POST /api/v1/auth/login
    G->>K: send('user.validate', credentials)
    K->>U: Message
    U->>DB: Find user by email
    U->>U: Verify password
    U->>K: Response (user or error)
    K->>G: Reply
    alt Valid credentials
        G->>G: Generate tokens
        G-->>C: { accessToken, refreshToken }
    else Invalid
        G-->>C: 401 Unauthorized
    end

    Note over C,DB: Protected Request
    C->>G: GET /api/v1/auth/profile + Bearer
    G->>G: JwtStrategy validates token
    G->>K: send('user.find', { id })
    K->>U: Message
    U->>DB: Find user
    U->>K: Response
    K->>G: Reply
    G-->>C: User profile
```

## Service Dependencies

```mermaid
graph TB
    subgraph Gateway["Gateway Service"]
        GW_APP[AppModule]
        GW_AUTH[AuthModule]
        GW_HEALTH[HealthModule]
        GW_JWT[JwtStrategy]
    end

    subgraph UserSvc["User Service"]
        US_APP[AppModule]
        US_PRISMA[PrismaModule]
        US_USER[UserModule]
    end

    subgraph NotifSvc["Notification Service"]
        NS_APP[AppModule]
        NS_NOTIF[NotificationModule]
    end

    subgraph Shared["Shared Library"]
        CONST[Constants<br/>Kafka Topics]
        IFACE[Interfaces<br/>DTOs, Types]
    end

    GW_APP --> GW_AUTH
    GW_APP --> GW_HEALTH
    GW_AUTH --> GW_JWT
    GW_AUTH --> CONST
    GW_AUTH --> IFACE

    US_APP --> US_PRISMA
    US_APP --> US_USER
    US_USER --> CONST
    US_USER --> IFACE

    NS_APP --> NS_NOTIF
    NS_NOTIF --> CONST
    NS_NOTIF --> IFACE
```

## Database Schema

```mermaid
erDiagram
    USER {
        string id PK "CUID"
        string email UK "Unique"
        string password "Hashed"
        string name "Optional"
        string refreshToken "Hashed"
        datetime createdAt
        datetime updatedAt
    }
```

## Deployment Architecture

### Docker Compose

```mermaid
graph TB
    subgraph Infra["Infrastructure"]
        PG[(postgres:17)]
        REDIS[(redis:7)]
        ZK[zookeeper]
        KAFKA[kafka]
    end

    subgraph Apps["Applications"]
        GW[gateway:3000]
        USER[user-service]
        NOTIF[notification-service]
    end

    subgraph Network["microservices-network"]
        GW --> KAFKA
        GW --> REDIS
        USER --> KAFKA
        USER --> PG
        NOTIF --> KAFKA
        KAFKA --> ZK
    end
```

### Kubernetes

```mermaid
graph TB
    subgraph NS["namespace: microservices"]
        ING[Ingress<br/>api.example.com]

        subgraph GW["Gateway"]
            GW_DEP[Deployment<br/>2 replicas]
            GW_SVC[Service]
        end

        subgraph USER["User Service"]
            USER_DEP[Deployment]
        end

        subgraph NOTIF["Notification Service"]
            NOTIF_DEP[Deployment]
        end

        CM[ConfigMap]
        SEC[Secrets]
    end

    subgraph External["External Services"]
        KAFKA[Kafka]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    CLIENT[Client] --> ING
    ING --> GW_SVC --> GW_DEP
    GW_DEP --> KAFKA
    GW_DEP --> REDIS
    USER_DEP --> KAFKA
    USER_DEP --> PG
    NOTIF_DEP --> KAFKA

    GW_DEP --> CM
    GW_DEP --> SEC
```

## Component Overview

| Service | Technology | Purpose |
|---------|------------|---------|
| Gateway | NestJS 11 | HTTP API, JWT auth, request routing |
| User Service | NestJS 11 | User CRUD, auth validation |
| Notification Service | NestJS 11 | Email/SMS sending |
| Kafka | kafkajs | Inter-service messaging |
| PostgreSQL 17 | Prisma 6 | User data storage |
| Redis 7 | ioredis | Caching, rate limiting |

## Shared Library

```typescript
// libs/shared/src/constants/index.ts
export const KAFKA_TOPICS = {
  USER: {
    REGISTER: 'user.register',
    LOGIN: 'user.validate',
    FIND_BY_ID: 'user.find',
    UPDATE: 'user.update',
  },
  NOTIFICATION: {
    SEND_EMAIL: 'notification.send.email',
    SEND_WELCOME: 'notification.send.welcome',
    SEND_PASSWORD_RESET: 'notification.send.password-reset',
  },
};

export const SERVICE_NAMES = {
  GATEWAY: 'gateway',
  USER_SERVICE: 'user-service',
  NOTIFICATION_SERVICE: 'notification-service',
};
```

## Security Layers

1. **JWT Authentication** - Gateway validates tokens
2. **Rate Limiting** - ThrottlerGuard (100 req/60s)
3. **bcrypt** - Password hashing in User Service
4. **Hashed Refresh Tokens** - Stored in database
5. **Network Isolation** - Kafka internal communication
