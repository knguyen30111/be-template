import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../constants/rbac.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const user = this.getUser(context);

    if (!user?.role) {
      throw new ForbiddenException('No role assigned to user');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}`,
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
