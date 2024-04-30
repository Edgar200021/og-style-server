import { Body, Controller, Post } from '@nestjs/common';
import { successResponse } from 'src/common/utils/apiResponse';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);

    return successResponse(product);
  }
}
