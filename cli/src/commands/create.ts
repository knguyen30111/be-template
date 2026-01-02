import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { scaffoldRbac } from '../utils/rbac-scaffolder';
import { patchAppModule } from '../utils/patch-app-module';
import { patchPrismaSchema } from '../utils/patch-prisma-schema';

interface CreateOptions {
  withRbac: boolean | string;
  skipInstall: boolean;
}

const VALID_TEMPLATES = ['rest-api', 'graphql', 'hybrid', 'microservices'];

export async function createProject(
  template: string,
  projectName: string,
  options: CreateOptions,
): Promise<void> {
  console.log(chalk.blue('\n🚀 Creating NestJS project...\n'));

  // Validate template
  if (!VALID_TEMPLATES.includes(template)) {
    console.error(
      chalk.red(`Invalid template: ${template}`),
      chalk.yellow(`\nValid options: ${VALID_TEMPLATES.join(', ')}`),
    );
    process.exit(1);
  }

  const cliDir = path.resolve(__dirname, '../..');
  const repoRoot = path.resolve(cliDir, '..');
  const templatePath = path.join(repoRoot, template);
  const destPath = path.resolve(process.cwd(), projectName);

  // Check if destination exists
  if (fs.existsSync(destPath)) {
    console.error(chalk.red(`Directory already exists: ${projectName}`));
    process.exit(1);
  }

  // Copy template
  console.log(chalk.cyan(`📁 Copying ${template} template...`));
  await fs.copy(templatePath, destPath, {
    filter: (src) => {
      const relativePath = path.relative(templatePath, src);
      // Skip node_modules, dist, .git
      return !relativePath.includes('node_modules') &&
             !relativePath.includes('dist') &&
             !relativePath.startsWith('.git');
    },
  });

  // Handle RBAC option
  if (options.withRbac) {
    const rbacMode = options.withRbac === true ? 'config' : options.withRbac;
    console.log(chalk.cyan(`🔐 Adding RBAC module (mode: ${rbacMode})...`));

    await scaffoldRbac(destPath, rbacMode as 'config' | 'db', template);
    await patchAppModule(destPath, template);

    if (rbacMode === 'db') {
      await patchPrismaSchema(destPath, template);
    }
  }

  // Update package.json name
  const pkgPath = path.join(destPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = await fs.readJson(pkgPath);
    pkg.name = projectName;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }

  // Install dependencies
  if (!options.skipInstall) {
    console.log(chalk.cyan('\n📦 Installing dependencies...\n'));
    try {
      execSync('pnpm install', { cwd: destPath, stdio: 'inherit' });
    } catch {
      console.log(chalk.yellow('pnpm not found, trying npm...'));
      execSync('npm install', { cwd: destPath, stdio: 'inherit' });
    }
  }

  // Success message
  console.log(chalk.green('\n✅ Project created successfully!\n'));
  console.log(chalk.white('Next steps:'));
  console.log(chalk.gray(`  cd ${projectName}`));
  console.log(chalk.gray('  cp .env.example .env'));
  console.log(chalk.gray('  pnpm db:generate'));
  console.log(chalk.gray('  pnpm start:dev'));

  if (options.withRbac) {
    console.log(chalk.cyan('\n🔐 RBAC module added!'));
    console.log(chalk.gray('  Use @Roles("ADMIN") decorator on routes'));
    console.log(chalk.gray('  Use @Permissions("users:write") for granular control'));
  }
}
