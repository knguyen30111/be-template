import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RbacService } from '../rbac.service';
import { PERMISSIONS_KEY } from '../constants/rbac.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbacService: RbacService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const user = this.getUser(context);

    if (!user?.role) {
      throw new ForbiddenException('No role assigned to user');
    }

    // Check JWT cached permissions first (performance)
    if (user.permissions && Array.isArray(user.permissions)) {
      const hasAllPermissions = requiredPermissions.every(
        (p) => user.permissions.includes(p) || user.permissions.includes('*'),
      );
      if (hasAllPermissions) {
        return true;
      }
    }

    // Fallback to service lookup
    const hasAllPermissions = requiredPermissions.every((p) =>
      this.rbacService.hasPermission(user.role, p),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  private getUser(context: ExecutionContext) {
    const type = context.getType<string>();

    if (type === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req?.user;
    }

    // HTTP fallback
    const request = context.switchToHttp().getRequest();
    return request.user;
  }
}
