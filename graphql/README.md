# NestJS GraphQL Template

Production-ready NestJS GraphQL API template with schema-first approach, JWT authentication, Prisma ORM, and multi-target deployment support.

## Features

- **NestJS 11** with Node.js 22
- **GraphQL** with Apollo Server (schema-first approach)
- **PostgreSQL** with Prisma ORM
- **Authentication**: JWT + OAuth2 (Google, GitHub)
- **Caching**: Redis via @nestjs/cache-manager
- **Queue**: BullMQ for background jobs
- **Validation**: class-validator + Zod
- **Testing**: Vitest + Supertest
- **Security**: Helmet, rate limiting, CORS

## Quick Start

```bash
# Clone and setup
git clone https://github.com/be-boiler/nestjs-graphql-template.git my-api
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

GraphQL Playground available at: http://localhost:3000/graphql

## Project Structure

```
src/
├── config/              # Configuration modules
├── graphql/             # GraphQL schema files
│   └── schema.graphql   # Main schema definition
├── modules/
│   ├── auth/            # Authentication (resolver, guards, strategies)
│   ├── health/          # Health checks (resolver)
│   └── prisma/          # Database service
├── common/              # Shared utilities
├── app.module.ts        # Root module
└── main.ts              # Application entry
```

## GraphQL Schema

The schema is defined in `src/graphql/schema.graphql`. Types are auto-generated to `src/graphql/graphql.ts` on build.

### Available Operations

**Queries:**
- `health` - Health check status
- `me` - Current user (authenticated)
- `user(id: ID!)` - Get user by ID (authenticated)

**Mutations:**
- `register(input: RegisterInput!)` - User registration
- `login(input: LoginInput!)` - User login
- `refreshTokens` - Refresh JWT tokens
- `logout` - User logout

## Authentication

### JWT Authentication

Include the access token in the Authorization header:

```graphql
# HTTP Headers
{
  "Authorization": "Bearer <access_token>"
}
```

### OAuth2 Providers

OAuth callbacks are handled at REST endpoints:
- Google: `/auth/google/callback`
- GitHub: `/auth/github/callback`

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
pnpm db:push        # Push schema to database
```

## Environment Variables

```env
# App
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

## License

MIT
