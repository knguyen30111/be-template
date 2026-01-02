import { Injectable, Inject } from '@nestjs/common';
import { RBAC_OPTIONS } from './constants/rbac.constants';
import { RbacModuleOptions } from './interfaces/rbac.interface';

@Injectable()
export class RbacService {
  private permissionCache = new Map<string, Set<string>>();

  constructor(
    @Inject(RBAC_OPTIONS) private readonly options: RbacModuleOptions,
  ) {
    this.buildPermissionCache();
  }

  /**
   * Build permission cache at startup for O(1) lookups
   */
  private buildPermissionCache(): void {
    for (const role of this.options.roles) {
      const permissions = this.resolvePermissions(role.name, new Set());
      this.permissionCache.set(role.name, permissions);
    }
  }

  /**
   * Recursively resolve permissions including inherited roles
   */
  private resolvePermissions(
    roleName: string,
    visited: Set<string>,
  ): Set<string> {
    // Circular dependency check
    if (visited.has(roleName)) {
      return new Set();
    }
    visited.add(roleName);

    const role = this.options.roles.find((r) => r.name === roleName);
    if (!role) {
      return new Set();
    }

    const permissions = new Set(role.permissions);

    // Resolve inherited permissions
    for (const inheritedRole of role.inherits || []) {
      const inherited = this.resolvePermissions(inheritedRole, visited);
      inherited.forEach((p) => permissions.add(p));
    }

    return permissions;
  }

  /**
   * Check if user's role has the specified permission
   */
  hasPermission(userRole: string, permission: string): boolean {
    // Super admin bypasses all checks
    if (userRole === this.options.superAdminRole) {
      return true;
    }

    const permissions = this.permissionCache.get(userRole);
    if (!permissions) {
      return false;
    }

    // Check for exact match or wildcard
    return permissions.has(permission) || permissions.has('*');
  }

  /**
   * Check if user's role has all specified permissions
   */
  hasAllPermissions(userRole: string, requiredPermissions: string[]): boolean {
    return requiredPermissions.every((p) => this.hasPermission(userRole, p));
  }

  /**
   * Check if user's role has any of the specified permissions
   */
  hasAnyPermission(userRole: string, permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(userRole, p));
  }

  /**
   * Get all permissions for a role (including inherited)
   */
  getPermissionsForRole(roleName: string): string[] {
    return Array.from(this.permissionCache.get(roleName) || []);
  }

  /**
   * Get the default role name
   */
  getDefaultRole(): string {
    return this.options.defaultRole || 'USER';
  }

  /**
   * Get all available roles
   */
  getAllRoles(): string[] {
    return this.options.roles.map((r) => r.name);
  }

  /**
   * Check if a role exists
   */
  roleExists(roleName: string): boolean {
    return this.options.roles.some((r) => r.name === roleName);
  }
}
