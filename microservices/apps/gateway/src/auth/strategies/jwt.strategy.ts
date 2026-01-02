import { Injectable, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') implements OnModuleInit {
  constructor(
    config: ConfigService,
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async onModuleInit() {
    this.userClient.subscribeToResponseOf('user.find');
    await this.userClient.connect();
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await firstValueFrom(
      this.userClient.send('user.find', { id: payload.sub }).pipe(timeout(5000)),
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
