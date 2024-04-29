import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuthApp } from 'octokit';
import { GithubSignInDto } from '../../dto/github-sign-in.dto';
import socialConfig from '../config/social.config';

@Injectable()
export class GithubAuthenticationService implements OnModuleInit {
  private oAuthApp: OAuthApp;
  constructor(
    @Inject(socialConfig.KEY)
    private readonly socialConfiguration: ConfigType<typeof socialConfig>,
  ) {}

  onModuleInit() {
    this.oAuthApp = new OAuthApp({
      clientType: 'oauth-app',
      clientId: this.socialConfiguration.githubClientId,
      clientSecret: this.socialConfiguration.githubClientSecret,
    });
  }

  generateWebAuthorizationUri() {
    const { url } = this.oAuthApp.getWebFlowAuthorizationUrl({});

    return url;
  }

  async getUser({ code }: GithubSignInDto) {
    try {
      const data = await this.oAuthApp.getUserOctokit({ code });
      const token = await this.oAuthApp.createToken({ code });
      console.log(token);
      return data;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Неправильный токен');
    }
  }
}
