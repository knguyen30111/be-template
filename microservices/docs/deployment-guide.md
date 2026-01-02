# Deployment Guide

## Deployment Options

```mermaid
graph LR
    CODE[Source Code]
    CODE --> DOCKER[Docker Compose]
    CODE --> K8S[Kubernetes]
```

## Docker Compose Deployment

### Architecture

```mermaid
graph TB
    subgraph Stack["Docker Compose Stack"]
        subgraph Infra["Infrastructure"]
            PG[(postgres<br/>:5432)]
            REDIS[(redis<br/>:6379)]
            ZK[zookeeper<br/>:2181]
            KAFKA[kafka<br/>:9092]
        end

        subgraph Apps["Applications"]
            GW[gateway<br/>:3000]
            USER[user-service]
            NOTIF[notification-service]
        end
    end

    CLIENT[Client] --> GW
    GW --> KAFKA
    GW --> REDIS
    USER --> KAFKA
    USER --> PG
    NOTIF --> KAFKA
    KAFKA --> ZK
```

### Service Dependencies

```mermaid
graph LR
    ZK[Zookeeper] --> KAFKA[Kafka]
    PG[PostgreSQL] --> USER[User Service]
    KAFKA --> GW[Gateway]
    KAFKA --> USER
    KAFKA --> NOTIF[Notification]
    REDIS[Redis] --> GW
```

### Startup Order

| Order | Service | Depends On |
|-------|---------|------------|
| 1 | postgres | - |
| 2 | redis | - |
| 3 | zookeeper | - |
| 4 | kafka | zookeeper (healthy) |
| 5 | user-service | kafka, postgres (healthy) |
| 6 | notification-service | kafka (healthy) |
| 7 | gateway | kafka, redis (healthy) |

### Commands

```bash
# Start infrastructure
docker compose up -d postgres redis zookeeper kafka

# Wait for healthy, then start apps
docker compose up -d

# View all logs
docker compose logs -f

# View specific service
docker compose logs -f gateway

# Rebuild and restart
docker compose up -d --build
```

## Kubernetes Deployment

### Architecture

```mermaid
graph TB
    subgraph Cluster["K8s Cluster"]
        subgraph NS["namespace: microservices"]
            ING[Ingress<br/>nginx]

            subgraph GW["Gateway"]
                GW_SVC[Service<br/>ClusterIP]
                GW_DEP[Deployment<br/>2 replicas]
            end

            subgraph USER["User Service"]
                USER_DEP[Deployment<br/>1 replica]
            end

            subgraph NOTIF["Notification"]
                NOTIF_DEP[Deployment<br/>1 replica]
            end

            CM[ConfigMap]
            SEC[Secrets]
        end
    end

    subgraph External["External/Managed"]
        KAFKA[Kafka Cluster]
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
```

### Resource Allocations

| Service | Replicas | CPU Req | CPU Lim | Mem Req | Mem Lim |
|---------|----------|---------|---------|---------|---------|
| Gateway | 2 | 100m | 500m | 128Mi | 256Mi |
| User Service | 1 | 100m | 500m | 128Mi | 256Mi |
| Notification | 1 | 50m | 200m | 64Mi | 128Mi |

### Deploy Commands

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply config
kubectl apply -f k8s/configmap.yaml

# Create secrets (edit first!)
cp k8s/secrets.example.yaml k8s/secrets.yaml
# Edit secrets.yaml with real values
kubectl apply -f k8s/secrets.yaml

# Deploy services
kubectl apply -f k8s/gateway/
kubectl apply -f k8s/user-service/
kubectl apply -f k8s/notification-service/

# Check status
kubectl get pods -n microservices
kubectl get svc -n microservices
```

### Health Probes

| Service | Probe | Path | Initial | Period |
|---------|-------|------|---------|--------|
| Gateway | Liveness | /health | 30s | 10s |
| Gateway | Readiness | /health | 5s | 5s |

## Environment Variables

### Gateway

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | production |
| PORT | Yes | 3000 |
| KAFKA_BROKERS | Yes | kafka:29092 |
| REDIS_URL | Yes | redis://redis:6379 |
| JWT_ACCESS_SECRET | Yes | JWT signing key |
| JWT_REFRESH_SECRET | Yes | Refresh token key |
| JWT_EXPIRES_IN | No | 15m |
| JWT_REFRESH_EXPIRES_IN | No | 7d |

### User Service

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | production |
| KAFKA_BROKERS | Yes | kafka:29092 |
| DATABASE_URL | Yes | PostgreSQL connection |

### Notification Service

| Variable | Required | Description |
|----------|----------|-------------|
| NODE_ENV | Yes | production |
| KAFKA_BROKERS | Yes | kafka:29092 |

## Scaling Considerations

### Gateway
- Stateless, scale horizontally
- Add replicas for high traffic
- Use HPA for auto-scaling

### User Service
- Scale based on message backlog
- Monitor Kafka consumer lag
- Database connection pooling

### Notification Service
- Scale based on queue depth
- Rate limit external APIs
- Implement retry logic

## Monitoring

```mermaid
graph LR
    subgraph Services
        GW[Gateway]
        USER[User Service]
        NOTIF[Notification]
    end

    subgraph Monitoring
        PROM[Prometheus]
        GRAF[Grafana]
    end

    GW --> PROM
    USER --> PROM
    NOTIF --> PROM
    PROM --> GRAF
```

### Key Metrics

| Metric | Description |
|--------|-------------|
| HTTP latency | Gateway response times |
| Kafka consumer lag | Message processing delay |
| Error rate | 4xx/5xx responses |
| DB connections | Pool utilization |
