import { ApiProperty } from '@nestjs/swagger';
import { ProductModel } from './product-model.class';

export class GetProductsModel {
  @ApiProperty({ type: [ProductModel] })
  products: ProductModel[];
  @ApiProperty({ type: String })
  totalPages: string;
}
