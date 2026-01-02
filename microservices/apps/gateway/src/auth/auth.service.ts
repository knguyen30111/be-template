import { Injectable, Inject, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientKafka,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.userClient.subscribeToResponseOf('user.register');
    this.userClient.subscribeToResponseOf('user.validate');
    this.userClient.subscribeToResponseOf('user.find');
    this.userClient.subscribeToResponseOf('user.update');
    await this.userClient.connect();
  }

  async register(dto: RegisterDto) {
    const user = await firstValueFrom(
      this.userClient.send('user.register', dto).pipe(timeout(5000)),
    );

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await firstValueFrom(
      this.userClient.send('user.validate', dto).pipe(timeout(5000)),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(userId: string) {
    const user = await firstValueFrom(
      this.userClient.send('user.find', { id: userId }).pipe(timeout(5000)),
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await firstValueFrom(
      this.userClient.send('user.update', { id: userId, refreshToken: null }).pipe(timeout(5000)),
    );

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    return firstValueFrom(
      this.userClient.send('user.find', { id: userId }).pipe(timeout(5000)),
    );
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    // Store refresh token hash in user service
    await firstValueFrom(
      this.userClient.send('user.update', { id: user.id, refreshToken }).pipe(timeout(5000)),
    );

    return { accessToken, refreshToken, user };
  }
}
