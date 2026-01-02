# Deployment Guide

## Deployment Options

```mermaid
graph LR
    subgraph Options["Deployment Targets"]
        DOCKER[Docker]
        K8S[Kubernetes]
        SERVERLESS[Serverless]
        PM2[PM2/VPS]
    end

    CODE[Source Code] --> DOCKER
    CODE --> K8S
    CODE --> SERVERLESS
    CODE --> PM2
```

## Docker Deployment

### Architecture

```mermaid
graph TB
    subgraph Docker["Docker Compose Stack"]
        API[NestJS API<br/>:3000]
        PG[(PostgreSQL<br/>:5432)]
        REDIS[(Redis<br/>:6379)]
    end

    CLIENT[Client] --> API
    API --> PG
    API --> REDIS
```

### Build & Run

```bash
# Build production image
docker build -f docker/Dockerfile -t nestjs-api .

# Run with docker-compose
docker compose up -d

# View logs
docker compose logs -f api
```

### Dockerfile Stages

| Stage | Purpose |
|-------|---------|
| builder | Install deps, build app |
| production | Copy dist, run as non-root |

## Kubernetes Deployment

### Architecture

```mermaid
graph TB
    subgraph Cluster["K8s Cluster"]
        ING[Ingress<br/>nginx]

        subgraph NS["namespace: default"]
            SVC[Service<br/>ClusterIP]
            DEP[Deployment<br/>2 replicas]
            CM[ConfigMap]
            SEC[Secrets]
        end
    end

    subgraph External["External Services"]
        PG[(PostgreSQL)]
        REDIS[(Redis)]
    end

    CLIENT[Client] --> ING
    ING --> SVC
    SVC --> DEP
    DEP --> CM
    DEP --> SEC
    DEP --> PG
    DEP --> REDIS
```

### Deploy Commands

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment
kubectl get pods -l app=nestjs-api

# View logs
kubectl logs -l app=nestjs-api -f
```

### Resource Limits

| Resource | Request | Limit |
|----------|---------|-------|
| CPU | 100m | 500m |
| Memory | 128Mi | 512Mi |

### Health Probes

| Probe | Path | Initial | Period |
|-------|------|---------|--------|
| Liveness | /api/health | 30s | 10s |
| Readiness | /api/health/ready | 5s | 5s |

## Serverless Deployment

### Google Cloud Functions

```mermaid
graph LR
    REQ[HTTP Request] --> GCF[Cloud Function]
    GCF --> PG[(Cloud SQL)]
    GCF --> MEM[(Memorystore)]
```

```bash
# Deploy to GCP
npx serverless deploy --stage prod

# Deploy to specific region
npx serverless deploy --stage prod --region us-central1
```

### AWS Lambda

```bash
# Deploy to AWS
npx serverless deploy --stage prod --provider aws
```

## PM2 Deployment (VPS)

### Architecture

```mermaid
graph TB
    subgraph VPS["VPS Server"]
        NGINX[nginx<br/>reverse proxy]
        PM2[PM2 Cluster]
        subgraph Workers["Node Workers"]
            W1[Worker 1]
            W2[Worker 2]
            WN[Worker N]
        end
    end

    CLIENT[Client] --> NGINX
    NGINX --> PM2
    PM2 --> W1
    PM2 --> W2
    PM2 --> WN
```

### Deploy Commands

```bash
# Build application
pnpm build

# Start with PM2
pm2 start pm2.ecosystem.config.js --env production

# View status
pm2 status

# View logs
pm2 logs
```

### PM2 Configuration

| Setting | Value |
|---------|-------|
| Instances | max (CPU cores) |
| Exec Mode | cluster |
| Max Memory | 512MB |
| Auto Restart | true |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | Environment mode |
| PORT | Yes | Server port |
| DATABASE_URL | Yes | PostgreSQL connection |
| REDIS_URL | Yes | Redis connection |
| JWT_ACCESS_SECRET | Yes | JWT signing key |
| JWT_REFRESH_SECRET | Yes | Refresh token key |
| GOOGLE_CLIENT_ID | No | OAuth client |
| GITHUB_CLIENT_ID | No | OAuth client |

## CI/CD Pipeline

```mermaid
graph LR
    PUSH[Git Push] --> BUILD[Build & Test]
    BUILD --> SCAN[Security Scan]
    SCAN --> IMAGE[Build Image]
    IMAGE --> DEPLOY[Deploy]
```
