import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envSchema } from 'env';
import { dbConfig } from './configs/db.config';
import { mailerConfig } from './configs/mailer.config';
import { DB_TOKEN } from './db/db.constants';
import { IamModule } from './iam/iam.module';
import { ProductModule } from './product/product.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
    }),
    IamModule,
    ProductModule,
    UserModule,
    DrizzlePGModule.registerAsync({
      tag: DB_TOKEN,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: dbConfig,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: mailerConfig,
    }),
    RedisModule,
    CartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
