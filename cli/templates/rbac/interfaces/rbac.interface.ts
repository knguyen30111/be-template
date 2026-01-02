import { ModuleMetadata, InjectionToken, OptionalFactoryDependency } from '@nestjs/common';

export interface Permission {
  resource: string; // 'users', 'posts', 'orders'
  action: string; // 'read', 'write', 'delete', 'manage'
}

export interface RoleConfig {
  name: string;
  inherits?: string[]; // Roles this role inherits from
  permissions: string[]; // 'users:read', 'users:write'
}

export interface RbacModuleOptions {
  roles: RoleConfig[];
  defaultRole?: string;
  superAdminRole?: string; // Bypasses all permission checks
}

export interface RbacModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<RbacModuleOptions> | RbacModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export interface JwtPayloadWithRbac {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
}
