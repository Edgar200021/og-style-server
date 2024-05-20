import * as schema from 'src/db/schema';
export interface GetCartProducts {
  products: (schema.CartProduct &
    Pick<schema.Product, 'name' | 'images' | 'price' | 'discountedPrice'>)[];
  totalPages: number;
}
