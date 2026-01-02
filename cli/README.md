# create-nestjs-app CLI

Scaffold NestJS projects with modular features like RBAC.

## Installation

```bash
# From the cli directory
pnpm install
pnpm build

# Link globally (optional)
pnpm link --global
```

## Usage

```bash
create-nestjs-app <template> <project-name> [options]
```

### Templates

- `rest-api` - REST API with Prisma, JWT auth, Google OAuth
- `graphql` - GraphQL API with Prisma, JWT auth, code-first schema
- `hybrid` - Combined REST + GraphQL API
- `microservices` - Kafka-based microservices architecture

### Options

| Option | Description |
|--------|-------------|
| `--with-rbac [mode]` | Add RBAC module (`config` or `db`) |
| `--skip-install` | Skip npm/pnpm install |

### Examples

```bash
# Create REST API with config-based RBAC
create-nestjs-app rest-api my-api --with-rbac

# Create GraphQL API with DB-backed RBAC
create-nestjs-app graphql my-graphql-api --with-rbac=db

# Create microservices without installing deps
create-nestjs-app microservices my-platform --with-rbac --skip-install
```

## RBAC Module

When using `--with-rbac`, the CLI adds a complete RBAC module with:

### Features

- **Hierarchical roles** - Role inheritance (ADMIN inherits MODERATOR perms)
- **Granular permissions** - `users:read`, `users:write`, etc.
- **Decorators** - `@Roles('ADMIN')`, `@Permissions('users:write')`
- **Guards** - `RolesGuard`, `PermissionsGuard`
- **JWT caching** - Permissions embedded in JWT for O(1) checks

### RBAC Modes

**Config mode** (`--with-rbac` or `--with-rbac=config`):
- Roles defined in `config/rbac.config.ts`
- No database tables required
- Best for simple, static role hierarchies

**DB mode** (`--with-rbac=db`):
- Adds Prisma models: `DbRole`, `DbPermission`
- Enables runtime role/permission management
- Best for dynamic, admin-configurable RBAC

### Usage in Controllers

```typescript
import { Roles, Permissions } from './modules/rbac';
import { RolesGuard, PermissionsGuard } from './modules/rbac';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {

  @Get()
  @Roles('ADMIN', 'MODERATOR')
  findAll() {
    // Only ADMIN and MODERATOR can access
  }

  @Delete(':id')
  @Permissions('users:delete')
  @UseGuards(PermissionsGuard)
  remove(@Param('id') id: string) {
    // Requires users:delete permission
  }
}
```

### Default Role Hierarchy

```
SUPER_ADMIN (bypasses all checks)
    └── ADMIN
        └── MODERATOR
            └── USER
```

| Role | Permissions |
|------|-------------|
| USER | `profile:read`, `profile:write` |
| MODERATOR | USER + `users:read`, `content:moderate` |
| ADMIN | MODERATOR + `users:write`, `users:delete`, `settings:manage` |
| SUPER_ADMIN | `*` (all permissions) |

## Development

```bash
# Build
pnpm build

# Run without building
pnpm dev rest-api my-project --with-rbac
```
