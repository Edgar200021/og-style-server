import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/db/db.constants';
import * as schema from 'src/db/schema';
import { AddCartProductDto } from './dto/add-cart-product.dto';
import { CartFiltersDto } from './dto/cart-filters.dto';
import { DeleteCartProductDto } from './dto/delete-cart-product.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';
import { GetCartProducts } from './interfaces/get-cart-products.response';

@Injectable()
export class CartService {
  constructor(@Inject(DB_TOKEN) private db: NodePgDatabase<typeof schema>) {}

  async getAll(
    userId: schema.User['id'],
    { limit = 12, page = 2 }: CartFiltersDto,
  ): Promise<GetCartProducts> {
    const result = await this.db
      .select({
        id: schema.cart.id,
      })
      .from(schema.cart)
      .where(eq(schema.cart.userId, userId));

    const [products, quantity] = await Promise.all([
      await this.db
        .select()
        .from(schema.cartProduct)
        .where(eq(schema.cartProduct.cartId, result[0].id))
        .offset(page * limit - limit)
        .limit(limit),
      await this.db
        .select({ count: count() })
        .from(schema.cartProduct)
        .where(eq(schema.cartProduct.cartId, result[0].id)),
    ]);

    const totalPages = Math.ceil(quantity[0].count / limit);

    return { totalPages, products };
  }

  async add(
    userId: schema.User['id'],
    { productId, color, size, quantity = 1 }: AddCartProductDto,
  ) {
    const product = await this.db
      .select()
      .from(schema.product)
      .where(eq(schema.product.id, productId));

    if (!product) throw new BadRequestException('Товар не найден');

    const result = await this.db
      .select()
      .from(schema.cart)
      .where(eq(schema.cart.userId, userId));

    const filters = and(
      eq(schema.cartProduct.cartId, result[0].id),
      eq(schema.cartProduct.productId, productId),
      eq(schema.cartProduct.color, color),
      eq(schema.cartProduct.size, size),
    );

    const isExist = await this.db
      .select()
      .from(schema.cartProduct)
      .where(filters);

    if (isExist) {
      await this.db
        .update(schema.cartProduct)
        .set({ quantity: isExist[0].quantity + 1 })
        .where(filters);
      return;
    }

    await this.db.insert(schema.cartProduct).values({
      cartId: result[0].id,
      productId,
      color,
      size,
      quantity,
    });
  }

  async delete(
    userId: schema.User['id'],
    { cartProductId }: DeleteCartProductDto,
  ) {
    await this.db
      .delete(schema.cartProduct)
      .where(eq(schema.cartProduct.id, cartProductId));
  }

  async update(
    userId: schema.User['id'],
    { quantity, cartProductId }: UpdateCartProductDto,
  ) {
    await this.db
      .update(schema.cartProduct)
      .set({ quantity })
      .where(eq(schema.cartProduct.id, cartProductId));
  }

  async create(userId: schema.User['id']) {
    await this.db.insert(schema.cart).values({ userId });
  }
}
