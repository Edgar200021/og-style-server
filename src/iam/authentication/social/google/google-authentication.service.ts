import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../../auth.service';
import { GoogleTokenDto } from '../../dto/google-token.dto';
import { SignInResponse } from '../../interfaces/sign-in.response';
import socialConfig from '../config/social.config';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly cartService: CartService,
    private readonly authService: AuthService,
    @Inject(socialConfig.KEY)
    private readonly socialConfiguration: ConfigType<typeof socialConfig>,
  ) {}

  onModuleInit() {
    this.oauthClient = new OAuth2Client({
      clientId: this.socialConfiguration.googleClientId,
      clientSecret: this.socialConfiguration.googleClientSecret,
      projectId: this.socialConfiguration.googleProjectId,
    });
  }

  async authenticate(googleTokenDto: GoogleTokenDto): Promise<SignInResponse> {
    try {
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
      });

      const { name, picture, email, sub: googleId } = loginTicket.getPayload();

      const user = await this.userService.getByOauthId(googleId, 'googleId');

      if (user) {
        const { accessToken, refreshToken } =
          await this.authService.generateTokens(user);

        return { accessToken, refreshToken, user };
      } else {
        const newUser = await this.userService.createFromOauth(
          email,
          googleId,
          'googleId',
          picture,
          name,
        );
        await this.cartService.create(newUser.id);
        const { accessToken, refreshToken } =
          await this.authService.generateTokens(newUser);

        return { accessToken, refreshToken, user: newUser };
      }
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Неправильный токен');
    }
  }
}
