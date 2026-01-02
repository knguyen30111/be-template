import path from 'path';
import fs from 'fs-extra';

const RBAC_FILES = {
  shared: [
    'rbac.module.ts',
    'rbac.service.ts',
    'config/rbac.config.ts',
    'interfaces/rbac.interface.ts',
    'decorators/roles.decorator.ts',
    'decorators/permissions.decorator.ts',
    'decorators/index.ts',
    'guards/roles.guard.ts',
    'guards/permissions.guard.ts',
    'guards/index.ts',
    'constants/rbac.constants.ts',
    'index.ts',
  ],
  db: ['entities/role.entity.ts', 'entities/permission.entity.ts'],
};

export async function scaffoldRbac(
  destPath: string,
  mode: 'config' | 'db',
  template: string,
): Promise<void> {
  const cliDir = path.resolve(__dirname, '../..');
  const templatesDir = path.join(cliDir, 'templates', 'rbac');

  // For microservices, place RBAC in libs/shared or gateway
  let rbacDestDir: string;
  if (template === 'microservices') {
    // Place in libs/shared for reuse across services
    rbacDestDir = path.join(destPath, 'libs', 'shared', 'src', 'rbac');
  } else {
    rbacDestDir = path.join(destPath, 'src', 'modules', 'rbac');
  }

  // Ensure destination exists
  await fs.ensureDir(rbacDestDir);

  // Copy shared files
  for (const file of RBAC_FILES.shared) {
    const srcFile = path.join(templatesDir, file);
    const destFile = path.join(rbacDestDir, file);
    await fs.ensureDir(path.dirname(destFile));
    await fs.copy(srcFile, destFile);
  }

  // Copy DB-specific files if mode is 'db'
  if (mode === 'db') {
    for (const file of RBAC_FILES.db) {
      const srcFile = path.join(templatesDir, file);
      const destFile = path.join(rbacDestDir, file);
      await fs.ensureDir(path.dirname(destFile));
      await fs.copy(srcFile, destFile);
    }
  }

  // Copy template-specific guards if needed (GraphQL context handling)
  if (template === 'graphql' || template === 'hybrid') {
    const graphqlGuardsDir = path.join(templatesDir, 'guards-graphql');
    if (await fs.pathExists(graphqlGuardsDir)) {
      await fs.copy(graphqlGuardsDir, path.join(rbacDestDir, 'guards'), {
        overwrite: true,
      });
    }
  }
}
