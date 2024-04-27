import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as schema from 'src/db/schema';
import { RedisService } from 'src/redis/services/redis.service';
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4 } from 'uuid';
import jwtConfig from '../config/jwt.config';
import { HashingService } from '../hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInResponse } from './interfaces/sign-in.response';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
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

    console.log(email, password);
    console.log(user);

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

  private async generateTokens(
    user: Omit<
      schema.User,
      'passwordResetToken' | 'passwordResetExpires' | 'password'
    >,
  ) {
    const refreshTokenId = uuidv4();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, this.jwtConfiguration.accessTokenExpires),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenExpires, {
        refreshTokenId,
      }),
    ]);

    this.redisService.insert(this.generateStrFromId(user.id), refreshTokenId);

    return { accessToken, refreshToken };
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

  private generateStrFromId(userId: number) {
    return `user-${userId}`;
  }
}
