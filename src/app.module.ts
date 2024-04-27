import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envSchema } from 'env';
import { DB_TOKEN } from './common/const';
import { dbConfig } from './configs/db.config';
import { IamModule } from './iam/iam.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';

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
    RedisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
