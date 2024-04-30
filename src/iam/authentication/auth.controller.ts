import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Env } from 'env';
import { Response } from 'express';
import { ApiSuccessResponse } from 'src/common/swagger/apiSuccessResponse';
import { UserModel } from 'src/common/swagger/models/user-model.class';
import { successResponse } from 'src/common/utils/apiResponse';
import * as schema from 'src/db/schema';
import { User } from '../decorators/user.decorator';
import { AuthService } from './auth.service';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from './authentication.constants';
import { Auth } from './decorators/auth.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GithubSignInDto } from './dto/github-sign-in.dto';
import { GoogleTokenDto } from './dto/google-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthType } from './enums/auth-type.enum';
import { SignInResponse } from './interfaces/sign-in.response';
import { GithubAuthenticationService } from './social/github/github-authentication.service';
import { GoogleAuthenticationService } from './social/google/google-authentication.service';

@ApiTags('Аутентификация / авторизация')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<Env, true>,
    private readonly googleAuthService: GoogleAuthenticationService,
    private readonly githubAuthService: GithubAuthenticationService,
  ) {}

  @ApiOperation({ summary: 'Создание аккаунта' })
  //  @ApiResponse({ status: 201 })
  @HttpCode(HttpStatus.CREATED)
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    console.log(signUpDto);
    await this.authService.signUp(signUpDto);
    return successResponse('Вы успешно зарегистрировались');
  }

  @ApiOperation({ summary: 'Вход в аккаунт' })
  @ApiSuccessResponse(UserModel)
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    ReturnType<
      typeof successResponse<
        Pick<schema.User, 'id' | 'name' | 'email' | 'avatar' | 'role'>
      >
    >
  > {
    const { user, accessToken, refreshToken } =
      await this.authService.signIn(signInDto);

    this.attachTokensToCookie(
      res,
      accessToken,
      refreshToken,
      Number(this.configService.get('ACCESS_COOKIE_MAX_AGE')),
      Number(this.configService.get('REFRESH_COOKIE_MAX_AGE')),
    );

    return successResponse(
      Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== 'password'),
      ) as SignInResponse['user'],
    );
  }

  @ApiOperation({ summary: 'Вход в аккаунт через google аккаунт' })
  @Post('google')
  async authenticate(
    @Body() tokenDto: GoogleTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.googleAuthService.authenticate(tokenDto);

    this.attachTokensToCookie(
      res,
      accessToken,
      refreshToken,
      Number(this.configService.get('ACCESS_COOKIE_MAX_AGE')),
      Number(this.configService.get('REFRESH_COOKIE_MAX_AGE')),
    );

    return successResponse(
      Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== 'password'),
      ),
    );
  }

  @ApiOperation({ summary: 'Получение url для редиректа на github ' })
  @Get('github')
  generateGithubUrl() {
    const url = this.githubAuthService.generateWebAuthorizationUri();

    return successResponse(url);
  }

  @ApiOperation({ summary: 'Вход в аккаунт через github аккаунт' })
  @Post('github')
  async test(
    @Body() body: GithubSignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.githubAuthService.getUser(body);

    this.attachTokensToCookie(
      res,
      accessToken,
      refreshToken,
      Number(this.configService.get('ACCESS_COOKIE_MAX_AGE')),
      Number(this.configService.get('REFRESH_COOKIE_MAX_AGE')),
    );

    return successResponse(
      Object.fromEntries(
        Object.entries(user).filter(([key]) => key !== 'password'),
      ),
    );
  }

  @ApiOperation({ summary: 'Выход из аккаунта' })
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.JWT)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @User('id') userId: number,
  ) {
    await this.authService.logout(userId);

    this.attachTokensToCookie(res, '', '', 0, 0);

    return successResponse('Вы вышли из аккаунта');
  }

  @ApiOperation({ summary: 'Смена пароля' })
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.JWT)
  @Patch('update-password')
  async updatePassword(
    @User('id') userId: number,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.authService.updatePassword(userId, updatePasswordDto);

    return successResponse('Пароль успешно изменен');
  }

  @ApiOperation({ summary: 'Запрос на сброс пароля' })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return successResponse(
      'Письмо с инструкциями по сбросу пароля выслано на почту',
    );
  }

  @ApiOperation({ summary: 'Сброс пароля' })
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
