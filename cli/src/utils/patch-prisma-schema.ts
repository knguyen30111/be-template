import path from 'path';
import fs from 'fs-extra';

const RBAC_PRISMA_MODELS = `
// RBAC Models
model DbRole {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  permissions DbPermission[]
  users       User[]
  parentId    String?
  parent      DbRole?      @relation("RoleHierarchy", fields: [parentId], references: [id])
  children    DbRole[]     @relation("RoleHierarchy")
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("roles")
}

model DbPermission {
  id        String   @id @default(cuid())
  resource  String
  action    String
  roles     DbRole[]
  createdAt DateTime @default(now())

  @@unique([resource, action])
  @@map("permissions")
}
`;

const USER_ROLE_RELATION = `
  // RBAC relation (optional - for DB-backed roles)
  dbRole      DbRole?  @relation(fields: [dbRoleId], references: [id])
  dbRoleId    String?`;

export async function patchPrismaSchema(
  destPath: string,
  template: string,
): Promise<void> {
  // Determine schema.prisma location
  let schemaPath: string;

  if (template === 'microservices') {
    // Try libs/shared first, then root prisma folder
    schemaPath = path.join(destPath, 'libs', 'shared', 'prisma', 'schema.prisma');
    if (!(await fs.pathExists(schemaPath))) {
      schemaPath = path.join(destPath, 'prisma', 'schema.prisma');
    }
  } else {
    schemaPath = path.join(destPath, 'prisma', 'schema.prisma');
  }

  if (!(await fs.pathExists(schemaPath))) {
    console.warn(`Warning: Could not find schema.prisma at ${schemaPath}`);
    return;
  }

  let content = await fs.readFile(schemaPath, 'utf-8');

  // Skip if already has RBAC models
  if (content.includes('model DbRole {')) {
    return;
  }

  // Add RBAC models at the end
  content = content + RBAC_PRISMA_MODELS;

  // Update User model to include dbRole relation if User model exists
  if (content.includes('model User {') && !content.includes('dbRoleId')) {
    // Find the closing brace of User model by counting braces
    const userModelStart = content.indexOf('model User {');
    let braceCount = 0;
    let userModelEnd = -1;

    for (let i = userModelStart; i < content.length; i++) {
      if (content[i] === '{') braceCount++;
      if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          userModelEnd = i;
          break;
        }
      }
    }

    if (userModelEnd !== -1) {
      // Insert relation before the closing brace
      content =
        content.slice(0, userModelEnd) +
        USER_ROLE_RELATION + '\n' +
        content.slice(userModelEnd);
    }
  }

  await fs.writeFile(schemaPath, content);
}
