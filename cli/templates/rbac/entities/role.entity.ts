/**
 * Role entity for database-backed RBAC
 *
 * This file is only included when using --with-rbac=db
 *
 * Prisma schema additions (add to schema.prisma):
 *
 * model Role {
 *   id          String       @id @default(cuid())
 *   name        String       @unique
 *   description String?
 *   permissions Permission[]
 *   users       User[]
 *   parentId    String?
 *   parent      Role?        @relation("RoleHierarchy", fields: [parentId], references: [id])
 *   children    Role[]       @relation("RoleHierarchy")
 *   createdAt   DateTime     @default(now())
 *   updatedAt   DateTime     @updatedAt
 *
 *   @@map("roles")
 * }
 */

export interface RoleEntity {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleWithRelations extends RoleEntity {
  permissions: PermissionEntity[];
  parent?: RoleEntity;
  children: RoleEntity[];
}

import { PermissionEntity } from './permission.entity';
