import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, arrayOverlaps, count, eq, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from 'src/db/db.constants';
import * as schema from 'src/db/schema';
import { AddCartProductDto } from './dto/add-cart-product.dto';
import { CartFiltersDto } from './dto/cart-filters.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';
import { GetCartProducts } from './interfaces/get-cart-products.response';

@Injectable()
export class CartService {
  constructor(@Inject(DB_TOKEN) private db: NodePgDatabase<typeof schema>) {}

  async getAll(
    userId: schema.User['id'],
    { limit = 12, page = 1 }: CartFiltersDto,
  ): Promise<GetCartProducts> {
    const result = await this.db
      .select({
        id: schema.cart.id,
      })
      .from(schema.cart)
      .where(eq(schema.cart.userId, userId));

    const [products, stats] = await Promise.all([
      await this.db
        .select({
          id: schema.cartProduct.id,
          productId: schema.cartProduct.productId,
          quantity: schema.cartProduct.quantity,
          size: schema.cartProduct.size,
          color: schema.cartProduct.color,
          name: schema.product.name,
          images: schema.product.images,
          price: schema.product.price,
          discountedPrice: schema.product.discountedPrice,
        })
        .from(schema.cartProduct)
        .leftJoin(
          schema.product,
          eq(schema.product.id, schema.cartProduct.productId),
        )
        .where(eq(schema.cartProduct.cartId, result[0].id))
        .offset(page * limit - limit)
        .limit(limit),
      await this.db
        .select({
          count: count(),
          totalDiscountedPrice: sql<number>`SUM(COALESCE(${schema.product.discountedPrice},${schema.product.price}) * ${schema.cartProduct.quantity})`,
          totalPrice: sql<number>`SUM(${schema.product.price} * ${schema.cartProduct.quantity})`,
        })
        .from(schema.cartProduct)
        .leftJoin(
          schema.product,
          eq(schema.product.id, schema.cartProduct.productId),
        )
        .where(eq(schema.cartProduct.cartId, result[0].id)),
    ]);

    const totalPages = Math.ceil(stats[0].count / limit);

    return {
      totalPages,
      totalPrice: stats[0].totalPrice,
      totalDiscountedPrice: stats[0].totalDiscountedPrice,
      //@ts-expect-error ---
      products,
    };
  }

  async add(
    userId: schema.User['id'],
    { productId, color, size, quantity = 1 }: AddCartProductDto,
  ) {
    const product = await this.db
      .select()
      .from(schema.product)
      .where(
        and(
          eq(schema.product.id, productId),
          arrayOverlaps(schema.product.colors, [color]),
          arrayOverlaps(schema.product.size, [size]),
        ),
      );

    if (!product[0]) throw new BadRequestException('Товар не найден');

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

    if (isExist[0]) {
      await this.db
        .update(schema.cartProduct)
        .set({ quantity: isExist[0].quantity + quantity })
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
  async update(cartProductId: number, { quantity }: UpdateCartProductDto) {
    await this.db
      .update(schema.cartProduct)
      .set({ quantity })
      .where(eq(schema.cartProduct.id, cartProductId));
  }

  async delete(cartProductId: number) {
    await this.db
      .delete(schema.cartProduct)
      .where(eq(schema.cartProduct.id, cartProductId));
  }

  async create(userId: schema.User['id']) {
    await this.db.insert(schema.cart).values({ userId });
  }
}
