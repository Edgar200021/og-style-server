import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/common/const';
import * as schema from 'src/db/schema';
@Injectable()
export class ProductService {
  constructor(@Inject(DB_TOKEN) private db: NodePgDatabase<typeof schema>) {}
}
