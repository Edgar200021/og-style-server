import * as schema from 'src/db/schema';
export interface GetCartProducts {
  products: schema.CartProduct[];
  totalPages: number;
}
