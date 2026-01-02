import { Resolver, Query } from '@nestjs/graphql';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';

import { PrismaService } from '../prisma/prisma.service';

@Resolver('HealthStatus')
export class HealthResolver {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Query('health')
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);

    return {
      status: result.status,
      info: result.info,
      error: result.error,
      details: result.details,
    };
  }
}
