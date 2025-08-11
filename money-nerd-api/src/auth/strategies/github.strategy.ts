import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { VerifyCallback } from 'passport-oauth2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    const clientID = configService.get<string>('GITHUB_CLIENT_ID');
    if (!clientID) throw new Error('Missing Github ClientID');

    const clientSecret = configService.get<string>('GITHUB_CLIENT_SECRET');
    if (!clientSecret) throw new Error('Missing Github Client Secret');

    const callbackURL = configService.get<string>('GITHUB_CALLBACK_URL');
    if (!callbackURL) throw new Error('Missing Github Callback URL');

    const options = {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
    };

    super(options);
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const { id, displayName, emails, photos } = profile;

    const user = {
      githubId: id,
      name: displayName,
      email: emails?.[0]?.value,
      picture: photos?.[0]?.value,
      accessToken,
    };

    done(null, user);
  }
}
