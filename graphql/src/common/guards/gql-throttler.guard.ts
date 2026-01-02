import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Custom ThrottlerGuard for GraphQL that extracts request from GQL context.
 * The default ThrottlerGuard doesn't work with GraphQL because it expects
 * a regular HTTP request context, not a GraphQL execution context.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const contextType = context.getType<string>();

    // Handle GraphQL context
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const ctx = gqlContext.getContext();
      return { req: ctx.req, res: ctx.res };
    }

    // Fall back to HTTP context for REST endpoints (health checks, etc.)
    const http = context.switchToHttp();
    return { req: http.getRequest(), res: http.getResponse() };
  }
}
