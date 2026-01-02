# NestJS Hybrid Template

Production-ready NestJS Hybrid API template combining REST and GraphQL endpoints, with JWT authentication, Prisma ORM, and multi-target deployment support.

## Features

- **NestJS 11** with Node.js 22
- **Hybrid API**: REST endpoints + GraphQL (schema-first)
- **PostgreSQL** with Prisma ORM
- **Authentication**: JWT + OAuth2 (Google, GitHub)
- **Caching**: Redis via @nestjs/cache-manager
- **Queue**: BullMQ for background jobs
- **API Docs**: Swagger (REST) + GraphQL Playground
- **Validation**: class-validator + Zod
- **Testing**: Vitest + Supertest
- **Security**: Helmet, rate limiting, CORS

## Quick Start

```bash
# Clone and setup
git clone https://github.com/be-boiler/nestjs-hybrid-template.git my-api
cd my-api
pnpm install

# Configure environment
cp .env.example .env

# Start database
docker compose up -d postgres redis

# Run migrations
pnpm db:push

# Start development server
pnpm start:dev
```

### API Endpoints

- **REST API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql

## Project Structure

```
src/
├── config/              # Configuration modules
├── graphql/             # GraphQL schema files
│   └── schema.graphql   # GraphQL schema definition
├── modules/
│   ├── auth/            # Authentication
│   │   ├── auth.controller.ts  # REST endpoints
│   │   ├── auth.resolver.ts    # GraphQL resolver
│   │   ├── guards/             # Auth guards
│   │   └── strategies/         # Passport strategies
│   ├── health/          # Health checks (REST + GraphQL)
│   └── prisma/          # Database service
├── common/              # Shared utilities
├── app.module.ts        # Root module
└── main.ts              # Application entry
```

## REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| GET | /api/health | Liveness check |

## GraphQL Operations

**Queries:**
- `health` - Health check status
- `me` - Current user (authenticated)
- `user(id: ID!)` - Get user by ID

**Mutations:**
- `register(input: RegisterInput!)` - User registration
- `login(input: LoginInput!)` - User login
- `refreshTokens` - Refresh JWT tokens
- `logout` - User logout

## Deployment

### Docker

```bash
docker build -f docker/Dockerfile -t my-api .
docker run -p 3000:3000 my-api
```

### Google Cloud Functions

```bash
npx serverless deploy --stage prod
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

### PM2

```bash
pm2 start pm2.ecosystem.config.js --env production
```

## Scripts

```bash
pnpm start:dev      # Development with hot reload
pnpm build          # Build for production
pnpm test           # Run tests
pnpm test:cov       # Test coverage
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Run migrations
```

## Environment Variables

```env
# App
NODE_ENV=development
PORT=3000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Swagger (optional)
SWAGGER_ENABLED=true
SWAGGER_TITLE=My API

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## License

MIT
