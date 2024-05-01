import { ApiProperty } from '@nestjs/swagger';
import * as schema from 'src/db/schema';
export class ProductModel {
  @ApiProperty({ type: Number })
  id: schema.Product['id'];

  @ApiProperty({ type: String })
  name: schema.Product['name'];

  @ApiProperty({ type: String })
  description: schema.Product['description'];

  @ApiProperty({ type: Number })
  price: schema.Product['price'];

  @ApiProperty({ type: Number })
  discountedPrice: schema.Product['discountedPrice'];

  @ApiProperty({ type: Number })
  discount: schema.Product['discount'];

  @ApiProperty({ enum: ['одежда', 'обувь'] })
  category: schema.Product['category'];

  @ApiProperty({ type: String })
  subCategory: schema.Product['subCategory'];

  @ApiProperty({ type: [String] })
  images: schema.Product['images'];

  @ApiProperty({ type: [String] })
  size: schema.Product['size'];

  @ApiProperty({ type: [String] })
  materials: schema.Product['materials'];

  @ApiProperty({ type: Number })
  brandId: schema.Product['brandId'];
}
