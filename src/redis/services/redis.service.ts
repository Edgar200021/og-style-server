import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisClientType } from '@redis/client';
import { Env } from 'env';
import { createClient } from 'redis';

@Injectable()
export class RedisService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService<Env, true>) {}

  async onApplicationBootstrap() {
    this.client = createClient({
      url: this.configService.get('REDIS_URL'),
    });
    await this.client.connect();
  }

  async onApplicationShutdown() {
    await this.client.disconnect();
    await this.client.quit();
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async insert(key: string, value: any) {
    await this.client.set(key, value);
  }

  async delete(key: string) {
    await this.client.del(key);
  }
}
