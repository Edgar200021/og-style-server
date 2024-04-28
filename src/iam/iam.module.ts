import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './authentication/auth.controller';
import { AuthService } from './authentication/auth.service';
import { AuthGuard } from './authentication/guards/auth.guard';
import { BcryptService } from './authentication/hashing/bcrypt.service';
import { HashingService } from './authentication/hashing/hashing.service';
import { RoleGuard } from './authorization/guards/role.guard';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    RedisModule,
    UserModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class IamModule {}
