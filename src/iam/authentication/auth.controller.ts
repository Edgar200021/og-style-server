import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { Env } from 'env';
import { Response } from 'express';
import { successResponse } from 'src/common/utils/apiResponse';
import { User } from '../decorators/user.decorator';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from './authentication.constants';
import { Auth } from './decorators/auth.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthType } from './enums/auth-type.enum';

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

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    this.attachTokensToCookie(
      res,
      accessToken,
      refreshToken,
      Number(this.configService.get('ACCESS_COOKIE_MAX_AGE')),
      Number(this.configService.get('REFRESH_COOKIE_MAX_AGE')),
    );

    return successResponse({
      data: Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== 'password'),
      ),
    });
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.JWT)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @User('id') userId: number,
  ) {
    await this.authService.logout(userId);

    this.attachTokensToCookie(res, '', '', 0, 0);
  }

  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.JWT)
  @Patch('update-password')
  async updatePassword(
    @User('id') userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.authService.updatePassword(userId, updatePasswordDto);

    return successResponse({
      message: 'Пароль успешно изменен',
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return successResponse({
      message: 'Письмо с инструкциями по сбросу пароля выслано на почту',
    });
  }

  @Patch('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return successResponse({
      message: 'Пароль успешно изменен',
    });
  }

  private attachTokensToCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessTokenMaxAge: number,
    refreshTokenMaxAge: number,
  ) {
    res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') == 'production',
      maxAge: accessTokenMaxAge,
      signed: true,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_KEY, refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') == 'production',
      maxAge: refreshTokenMaxAge,
      signed: true,
      path: '/',
    });
  }
}
