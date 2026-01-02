import { RbacModuleOptions } from '../interfaces/rbac.interface';

export const DEFAULT_RBAC_CONFIG: RbacModuleOptions = {
  defaultRole: 'USER',
  superAdminRole: 'SUPER_ADMIN',
  roles: [
    {
      name: 'USER',
      permissions: ['profile:read', 'profile:write'],
    },
    {
      name: 'MODERATOR',
      inherits: ['USER'],
      permissions: ['users:read', 'content:moderate'],
    },
    {
      name: 'ADMIN',
      inherits: ['MODERATOR'],
      permissions: ['users:write', 'users:delete', 'settings:manage'],
    },
    {
      name: 'SUPER_ADMIN',
      permissions: ['*'], // All permissions
    },
  ],
};
