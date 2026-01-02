# Deployment Guide

## Deployment Options

```mermaid
graph LR
    CODE[Source Code]

    CODE --> DOCKER[Docker]
    CODE --> K8S[Kubernetes]
    CODE --> SERVERLESS[Serverless]
    CODE --> PM2[PM2/VPS]
```

## Docker Deployment

### Architecture

```mermaid
graph TB
    subgraph Docker["Docker Compose"]
        API[NestJS Hybrid<br/>:3000]
        PG[(PostgreSQL<br/>:5432)]
        REDIS[(Redis<br/>:6379)]
    end

    REST[REST Client] --> API
    GQL[GraphQL Client] --> API
    API --> PG
    API --> REDIS
```

### Build & Run

```bash
# Production build
docker build -f docker/Dockerfile -t hybrid-api .

# Run stack
docker compose up -d

# View logs
docker compose logs -f api
```

## Kubernetes Deployment

### Architecture

```mermaid
graph TB
    subgraph Cluster["K8s Cluster"]
        ING[Ingress]
        SVC[Service]
        DEP[Deployment<br/>2 replicas]
        CM[ConfigMap]
    end

    subgraph External["External"]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    REST[REST] --> ING
    GQL[GraphQL] --> ING
    ING --> SVC --> DEP
    DEP --> CM
    DEP --> PG
    DEP --> REDIS
```

### Deploy

```bash
kubectl apply -f k8s/
kubectl get pods -l app=hybrid-api
```

### Resources

| Resource | Request | Limit |
|----------|---------|-------|
| CPU | 100m | 500m |
| Memory | 128Mi | 512Mi |

### Endpoints

| Type | Path | Description |
|------|------|-------------|
| REST | /api/* | REST endpoints |
| Swagger | /api/docs | REST documentation |
| GraphQL | /graphql | GraphQL endpoint |

## Serverless (GCP)

```mermaid
graph LR
    REQ[Request] --> GCF[Cloud Function]
    GCF --> SQL[(Cloud SQL)]
    GCF --> MEM[(Memorystore)]
```

```bash
npx serverless deploy --stage prod
```

## PM2 Deployment

```mermaid
graph TB
    subgraph VPS["VPS"]
        NGINX[nginx]
        PM2[PM2 Cluster]
        W1[Worker 1]
        W2[Worker N]
    end

    CLIENT --> NGINX --> PM2
    PM2 --> W1
    PM2 --> W2
```

```bash
pnpm build
pm2 start pm2.ecosystem.config.js --env production
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | Environment |
| PORT | Yes | Server port |
| API_PREFIX | Yes | REST prefix (api) |
| DATABASE_URL | Yes | PostgreSQL |
| REDIS_URL | Yes | Redis |
| JWT_ACCESS_SECRET | Yes | JWT key |
| JWT_REFRESH_SECRET | Yes | Refresh key |
| SWAGGER_ENABLED | No | Enable Swagger |
