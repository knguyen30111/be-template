/**
 * Permission entity for database-backed RBAC
 *
 * This file is only included when using --with-rbac=db
 *
 * Prisma schema additions (add to schema.prisma):
 *
 * model Permission {
 *   id        String   @id @default(cuid())
 *   resource  String
 *   action    String
 *   roles     Role[]
 *   createdAt DateTime @default(now())
 *
 *   @@unique([resource, action])
 *   @@map("permissions")
 * }
 */

export interface PermissionEntity {
  id: string;
  resource: string;
  action: string;
  createdAt: Date;
}

export interface PermissionWithRoles extends PermissionEntity {
  roles: { id: string; name: string }[];
}

/**
 * Helper to create permission string from entity
 */
export function toPermissionString(permission: PermissionEntity): string {
  return `${permission.resource}:${permission.action}`;
}

/**
 * Helper to parse permission string
 */
export function parsePermissionString(
  permission: string,
): { resource: string; action: string } | null {
  const parts = permission.split(':');
  if (parts.length !== 2) {
    return null;
  }
  return { resource: parts[0], action: parts[1] };
}
