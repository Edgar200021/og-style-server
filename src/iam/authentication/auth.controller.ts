import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from 'env';
import { Response } from 'express';
import { successResponse } from 'src/common/utils/apiResponse';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from './authentication.constants';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    await this.authService.signUp(signUpDto);
    return 'ok';
  }

  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    this.attachTokensToCookie(res, accessToken, refreshToken);

    return successResponse(
      Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== 'password'),
      ),
    );
  }

  @Post('logout')
  logout() {}

  @Post('forgot-password')
  forgotPassword() {}

  @Post('reset-password')
  resetPassword() {}

  private attachTokensToCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') == 'production',
      maxAge: this.configService.get('ACCESS_COOKIE_MAX_AGE'),
      signed: true,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') == 'production',
      maxAge: this.configService.get('REFRESH_COOKIE_MAX_AGE'),
      signed: true,
      path: '/',
    });
  }
}
