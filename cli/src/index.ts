#!/usr/bin/env node
import { Command } from 'commander';
import { createProject } from './commands/create';

const program = new Command();

program
  .name('create-nestjs-app')
  .description('Scaffold NestJS projects with modular features')
  .version('1.0.0');

program
  .argument('<template>', 'Template: rest-api | graphql | hybrid | microservices')
  .argument('<project-name>', 'Name of the project directory')
  .option('--with-rbac [mode]', 'Include RBAC module (config | db)', false)
  .option('--skip-install', 'Skip npm install', false)
  .action(createProject);

program.parse();
