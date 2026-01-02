# NestJS REST API Template

Production-ready NestJS REST API template with JWT authentication, Prisma ORM, and multi-target deployment support.

## Features

- **NestJS 11** with TypeScript
- **Authentication**: JWT (access + refresh tokens), OAuth2 (Google, GitHub)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis with cache-manager
- **Queue**: BullMQ for background jobs
- **Security**: Helmet, rate limiting, CORS
- **API Docs**: Swagger/OpenAPI
- **Testing**: Vitest + Supertest
- **Deployment**: Docker, Kubernetes, Serverless (AWS Lambda), PM2

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL
- Redis

### Installation

```bash
# Clone from template
gh repo create my-api --template be-boiler/nestjs-rest-api-template

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start development server
pnpm start:dev
```

### Using Docker

```bash
cd docker
docker-compose up
```

## Project Structure

```
src/
├── common/           # Shared utilities
│   ├── decorators/   # @CurrentUser, @Public, @Roles
│   ├── filters/      # Exception filters
│   ├── guards/       # Auth guards
│   └── interceptors/ # Logging, transform
├── config/           # Configuration with Zod validation
├── modules/
│   ├── auth/         # JWT + OAuth authentication
│   ├── health/       # Health check endpoints
│   └── prisma/       # Database service
├── app.module.ts
├── main.ts           # HTTP entry point
└── lambda.ts         # Serverless entry point
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| GET | /api/auth/google | Login with Google |
| GET | /api/auth/github | Login with GitHub |
| GET | /api/health | Liveness check |
| GET | /api/health/ready | Readiness check |

## Scripts

```bash
pnpm start:dev     # Development with hot reload
pnpm build         # Production build
pnpm test          # Run unit tests
pnpm test:e2e      # Run e2e tests
pnpm lint          # Lint code
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
```

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile -t my-api .
docker run -p 3000:3000 my-api
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

### AWS Lambda

```bash
npx serverless deploy
```

### PM2

```bash
pnpm build
pm2 start pm2.ecosystem.config.js --env production
```

## Environment Variables

See `.env.example` for all required variables.

## License

MIT
