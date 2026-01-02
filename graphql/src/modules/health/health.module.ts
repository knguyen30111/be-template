import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthResolver } from './health.resolver';
import { PrismaHealthIndicator } from './prisma.health';

@Module({
  imports: [TerminusModule],
  providers: [HealthResolver, PrismaHealthIndicator],
})
export class HealthModule {}
