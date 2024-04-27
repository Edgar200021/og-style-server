import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import jwtConfig from 'src/iam/config/jwt.config';
import { REQUEST_USER_KEY } from 'src/iam/iam.constants';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../authentication.constants';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authType = this.reflector.get<AuthType | undefined, string>(
      AUTH_TYPE_KEY,
      context.getHandler(),
    );

    if (authType == undefined || authType == AuthType.NONE) return true;

    const req = context.switchToHttp().getRequest<Request>(),
      res = context.switchToHttp().getResponse<Response>();

    return await this.verifyToken(req, res);
  }

  private async verifyToken(req: Request, res: Response) {
    try {
      if (req.signedCookies[ACCESS_TOKEN_KEY]) {
        const { sub } = await this.jwtService.verifyAsync<{
          sub: number;
        }>(req.signedCookies[ACCESS_TOKEN_KEY], this.jwtConfiguration);

        const user = await this.userService.getById(sub);
        if (!user) throw new UnauthorizedException('Пользователь не найден');

        req[REQUEST_USER_KEY] = user;
        return true;
      }

      const { user, accessToken, refreshToken } =
        await this.authService.refreshTokens(
          req.signedCookies[REFRESH_TOKEN_KEY],
        );

      this.attachTokensToCookie(res, accessToken, refreshToken);
      req[REQUEST_USER_KEY] = user;
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Ошибка авторизации');
    }
  }

  private attachTokensToCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: this.jwtConfiguration.nodeEnv == 'production',
      maxAge: this.jwtConfiguration.accessCookieMaxAge,
      signed: true,
    });

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: this.jwtConfiguration.nodeEnv == 'production',
      maxAge: this.jwtConfiguration.refreshCookieMaxAge,
      signed: true,
    });
  }
}
