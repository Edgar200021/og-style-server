import { DrizzlePGConfig } from '@knaadh/nestjs-drizzle-pg/src/node-postgres.interface';
import { ConfigService } from '@nestjs/config';
import * as schema from '../db/schema';

export const dbConfig = (
  configService: ConfigService,
): Promise<DrizzlePGConfig> | DrizzlePGConfig => {
  return {
    pg: {
      connection: 'pool' as const,
      config: {
        //connectionString: configService.get('DB_CONNECTION_STRING'),
        connectionString: configService.get('POSTGRES_URL'),
      },
    },
    config: { schema: { ...schema } },
  };
};
