import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import {
  Strategy,
  VerifyCallback,
  StrategyOptions,
  Profile,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const options: StrategyOptions = {
      clientID:
        configService.get<string>('GOOGLE_CLIENT_ID') ??
        (() => {
          throw new Error('Missing Google ClientID');
        })(),
      clientSecret:
        configService.get<string>('GOOGLE_CLIENT_SECRET') ??
        (() => {
          throw new Error('Missing Google Client Secret');
        })(),
      callbackURL:
        configService.get<string>('GOOGLE_CALLBACK_URL') ??
        (() => {
          throw new Error('Missing Callback');
        })(),
      scope: ['email', 'profile'],
    };

    super(options);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;

    const user = {
      email: emails?.[0]?.value,
      name: name?.givenName,
      picture: photos?.[0]?.value,
      googleId: profile.id,
      accessToken,
    };

    done(null, user);
  }
}
