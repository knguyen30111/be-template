import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { Provider } from '@prisma/client';
import { AuthService } from '../auth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    config: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = config.get('auth.github.clientId');
    const clientSecret = config.get('auth.github.clientSecret');
    const callbackURL = config.get('auth.github.callbackUrl');

    super({
      clientID: clientID || 'disabled',
      clientSecret: clientSecret || 'disabled',
      callbackURL: callbackURL || 'http://localhost:3000/api/auth/github/callback',
      scope: ['user:email'],
    });

    // Disable strategy if not configured
    if (!clientID || !clientSecret) {
      this.authenticate = () => {
        throw new Error('GitHub OAuth is not configured');
      };
    }
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: any) => void,
  ) {
    const { id, emails, displayName, username } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      return done(new Error('No email from GitHub'));
    }

    const user = await this.authService.validateOAuthUser(
      email,
      displayName || username,
      Provider.GITHUB,
      id,
    );

    done(null, user);
  }
}
