import path from 'path';
import fs from 'fs-extra';

export async function patchAppModule(
  destPath: string,
  template: string,
): Promise<void> {
  // Determine app.module.ts location based on template
  let appModulePath: string;

  if (template === 'microservices') {
    // Patch gateway's app.module.ts
    appModulePath = path.join(
      destPath,
      'apps',
      'gateway',
      'src',
      'app.module.ts',
    );
  } else {
    appModulePath = path.join(destPath, 'src', 'app.module.ts');
  }

  if (!(await fs.pathExists(appModulePath))) {
    console.warn(`Warning: Could not find app.module.ts at ${appModulePath}`);
    return;
  }

  let content = await fs.readFile(appModulePath, 'utf-8');

  // Skip if already patched
  if (content.includes('RbacModule')) {
    return;
  }

  // Determine import path based on template
  const rbacImport =
    template === 'microservices'
      ? `import { RbacModule } from '@app/shared/rbac';`
      : `import { RbacModule } from './modules/rbac';`;

  // Add import after the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, rbacImport);
  }

  content = lines.join('\n');

  // Find the feature modules comment and add RBAC module after it
  // Look for pattern like "// Feature modules" followed by module names
  const featureModulesPattern = /(\/\/ Feature modules\s*\n\s*)(\w+Module)/;
  const match = content.match(featureModulesPattern);

  if (match) {
    // Add RbacModule before the first feature module
    content = content.replace(
      featureModulesPattern,
      `$1RbacModule.forRoot(),\n    $2`,
    );
  } else {
    // Fallback: find HealthModule and add before it
    const healthModulePattern = /(\s+)(HealthModule,?\s*)/;
    const healthMatch = content.match(healthModulePattern);

    if (healthMatch) {
      content = content.replace(
        healthModulePattern,
        `$1RbacModule.forRoot(),\n$1$2`,
      );
    } else {
      // Last fallback: add before closing of imports array
      // Find the last module in imports array and add after it
      const importsEndPattern = /(\s+\w+Module,?)(\s*\],\s*providers)/;
      const importsMatch = content.match(importsEndPattern);

      if (importsMatch) {
        content = content.replace(
          importsEndPattern,
          `$1\n    RbacModule.forRoot(),$2`,
        );
      }
    }
  }

  await fs.writeFile(appModulePath, content);
}
