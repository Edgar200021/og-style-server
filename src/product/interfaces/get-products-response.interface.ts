import * as schema from 'src/db/schema';
export interface GetProductsResponse {
  products: schema.Product[];
  totalPages: number;
}
