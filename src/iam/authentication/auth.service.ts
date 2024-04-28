import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import crypto from 'node:crypto';
import * as schema from 'src/db/schema';
import { RedisService } from 'src/redis/services/redis.service';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import jwtConfig from '../config/jwt.config';

import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { HashingService } from './hashing/hashing.service';
import { SignInResponse } from './interfaces/sign-in.response';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const isUserExists = await this.userService.getByEmail(signUpDto.email);

    if (isUserExists)
      throw new BadRequestException(
        `пользователь с эл.почтой ${signUpDto.email} уже существует`,
      );

    const hashedPassword = await this.hashingService.hash(signUpDto.password);
    const user = await this.userService.create(signUpDto.email, hashedPassword);

    return user;
  }

  async signIn({ email, password }: SignInDto): Promise<SignInResponse> {
    const user = await this.userService.getByEmail(email, true);

    if (!user || !(await this.hashingService.compare(password, user.password)))
      throw new BadRequestException('неправильный пароль или эл.адрес');

    const { accessToken, refreshToken } = await this.generateTokens(user);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<{
        sub: number;
        refreshTokenId: string;
      }>(refreshToken, {
        secret: this.jwtConfiguration.secret,
      });

      const user = await this.userService.getById(sub);
      if (!user) throw new UnauthorizedException('Ошибка авторизации');

      const stringId = this.generateStrFromId(user.id);
      const storageRefreshToken = await this.redisService.get(stringId);

      if (storageRefreshToken !== refreshTokenId)
        throw new UnauthorizedException('Ошибка авторизации');

      await this.redisService.delete(stringId);

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user);

      return { user, accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Ошибка авторизации');
    }
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userService.getById(userId, true);

    if (
      !(await this.hashingService.compare(
        updatePasswordDto.oldPassword,
        user.password,
      ))
    )
      throw new BadRequestException('старый пароль неправильный');

    const hashedPassword = await this.hashingService.hash(
      updatePasswordDto.newPassword,
    );
    await this.userService.updatePassword(userId, hashedPassword);
  }

  async logout(userId: number) {
    await this.redisService.delete(this.generateStrFromId(userId));
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userService.getByEmail(email);
    if (!user)
      throw new NotFoundException(
        `Пользователь с эл.почтой ${email} не найден`,
      );

    const passwordToken = crypto.randomBytes(70).toString('hex'),
      passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15),
      hashedToken = await this.hashingService.hash(passwordToken);

    try {
      await this.sendPasswordResetEmail(user.email, passwordToken);

      await this.userService.updatePasswordResetToken(
        user.id,
        hashedToken,
        passwordResetExpires,
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Что-то пошло не так.');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, email, password } = resetPasswordDto;
    const user = await this.userService.getByPasswordResetExpires(email);

    if (
      !user ||
      !(await this.hashingService.compare(token, user.passwordResetToken))
    )
      throw new NotFoundException(`Неправильный токен или эл.почта`);

    const hashedPassword = await this.hashingService.hash(password);
    await this.userService.updatePassword(user.id, hashedPassword);
    await this.userService.updatePasswordResetToken(user.id, null, null);
  }

  private async generateTokens(
    user: Omit<
      schema.User,
      'passwordResetToken' | 'passwordResetExpires' | 'password'
    >,
  ) {
    try {
      const refreshTokenId = uuidv4();
      const [accessToken, refreshToken] = await Promise.all([
        this.signToken(user.id, this.jwtConfiguration.accessTokenExpires),
        this.signToken(user.id, this.jwtConfiguration.refreshTokenExpires, {
          refreshTokenId,
        }),
      ]);

      await this.redisService.insert(
        this.generateStrFromId(user.id),
        refreshTokenId,
        {
          EX: this.jwtConfiguration.refreshRedisMaxAge,
        },
      );

      return { accessToken, refreshToken };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(
        'Что-то пошло не так.Повторите попытку позже',
      );
    }
  }

  private async signToken<T>(
    userId: number,
    expiresIn: string | number,
    payload?: T,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  private async sendPasswordResetEmail(to: string, passwordResetToken) {
    await this.mailerService.sendMail({
      to,
      subject: 'Og-style: Восстановление пароля',
      html: `<p>Восстановите ваш пароль перейдя по <a href='${this.jwtConfiguration.clientUrl}/reset-password?token=${passwordResetToken}&email=${to}'>ссылке</a> </p>`,
    });
  }

  private generateStrFromId(userId: number) {
    return `user-${userId}`;
  }
}
