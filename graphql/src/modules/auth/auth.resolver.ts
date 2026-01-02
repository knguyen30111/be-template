import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';

import { AuthService } from './auth.service';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { GqlRefreshGuard } from './guards/gql-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Resolver('User')
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation('register')
  async register(
    @Args('input') input: { email: string; password: string; name?: string },
  ) {
    const tokens = await this.authService.register({
      email: input.email,
      password: input.password,
      name: input.name,
    });

    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    return {
      ...tokens,
      user,
    };
  }

  @Mutation('login')
  async login(
    @Args('input') input: { email: string; password: string },
  ) {
    const user = await this.authService.validateUser(input.email, input.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.authService.login(user);

    return {
      ...tokens,
      user,
    };
  }

  @UseGuards(GqlRefreshGuard)
  @Mutation('refreshTokens')
  async refreshTokens(@Context() context: { req: Request }) {
    const user = context.req.user as User & { refreshToken: string };
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation('logout')
  async logout(@CurrentUser() user: User): Promise<boolean> {
    await this.authService.logout(user.id);
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query('me')
  async me(@CurrentUser() user: User) {
    return user;
  }

  @UseGuards(GqlAuthGuard)
  @Query('user')
  async user(@Args('id') id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
