import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuthApp } from 'octokit';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../../auth.service';
import { GithubSignInDto } from '../../dto/github-sign-in.dto';
import { GithubToken } from '../../interfaces/github-token.interface';
import { GithubUser } from '../../interfaces/github-user.interface';
import { SignInResponse } from '../../interfaces/sign-in.response';
import socialConfig from '../config/social.config';

@Injectable()
export class GithubAuthenticationService implements OnModuleInit {
  private oAuthApp: OAuthApp;
  constructor(
    @Inject(socialConfig.KEY)
    private readonly socialConfiguration: ConfigType<typeof socialConfig>,
    private readonly userService: UserService,
    private readonly authService: AuthService,
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

  async getUser({ code }: GithubSignInDto): Promise<SignInResponse> {
    try {
      const searchParams = new URLSearchParams({
        code,
        client_id: this.socialConfiguration.githubClientId,
        client_secret: this.socialConfiguration.githubClientSecret,
      });

      const res = await fetch(
        `https://github.com/login/oauth/access_token?${searchParams.toString()}`,
        {
          method: 'POST',
          headers: { Accept: 'application/json' },
        },
      );
      const tokenData: GithubToken = await res.json();

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const { avatar_url, email, id, name }: GithubUser = await userRes.json();

      const user = await this.userService.getByOauthId(id, 'githubId');

      if (user) {
        console.log('OK');
        const { accessToken, refreshToken } =
          await this.authService.generateTokens(user);

        return { user, accessToken, refreshToken };
      } else {
        const isExists = await this.userService.getByEmail(email);
        if (isExists) {
          await this.userService.updateOauthId(isExists.id, 'githubId', id);
          const { accessToken, refreshToken } =
            await this.authService.generateTokens(isExists);

          return { user: isExists, accessToken, refreshToken };
        }

        const newUser = await this.userService.createFromOauth(
          email,
          id,
          'githubId',
          avatar_url,
          name,
        );

        console.log(newUser);

        const { accessToken, refreshToken } =
          await this.authService.generateTokens(newUser);

        return { user: newUser, accessToken, refreshToken };
      }
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Неправильный токен');
    }
  }
}
