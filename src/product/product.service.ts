import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/db/db.constants';
import * as schema from 'src/db/schema';
import { CreateProductDto } from './dto/create-product.dto';
@Injectable()
export class ProductService {
  constructor(@Inject(DB_TOKEN) private db: NodePgDatabase<typeof schema>) {}

  async get(id: number): Promise<schema.Product> | null {
    const product = await this.db
      .select()
      .from(schema.product)
      .where(eq(schema.product.id, id));

    return product[0] ?? null;
  }

  async getAll(): Promise<schema.Product[]> {
    return this.db.select().from(schema.product);
  }

  async create(createProductDto: CreateProductDto): Promise<schema.NewProduct> {
    const discountedPrice = createProductDto.discount
      ? createProductDto.price -
        (createProductDto.price * createProductDto.discount) / 100
      : 0;

    console.log(createProductDto);

    const user = await this.db
      .insert(schema.product)
      .values({
        ...createProductDto,
        price: String(createProductDto.price),
        discountedPrice: String(discountedPrice),
        //brandId: sql<number>`SELECT id FROM brand WHERE name = ${createProductDto.brand}`,
        brandId: 1,
      })
      .returning();

    return user[0];
  }
}
