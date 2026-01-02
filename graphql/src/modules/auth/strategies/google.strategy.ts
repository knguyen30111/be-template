import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = config.get('auth.google.clientId');
    const clientSecret = config.get('auth.google.clientSecret');
    const callbackURL = config.get('auth.google.callbackUrl');

    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL: callbackURL || 'http://localhost:3000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });

    // Disable strategy if not configured
    if (!clientID || !clientSecret) {
      this.authenticate = () => {
        throw new Error('Google OAuth is not configured');
      };
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, displayName } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(new Error('No email from Google'), undefined);
    }

    const user = await this.authService.validateOAuthUser(
      email,
      displayName,
      Provider.GOOGLE,
      id,
    );

    done(null, user);
  }
}
