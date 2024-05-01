import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from 'src/common/swagger/apiSuccessResponse';
import { GetProductsModel } from 'src/common/swagger/models/get-products-model.class';
import { successResponse } from 'src/common/utils/apiResponse';
import { CreateProductDto } from './dto/create-product.dto';
import { GetFiltersDto } from './dto/get-filters.dto';
import { ProductFilterDto } from './dto/product-filters.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('Продукты')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiSuccessResponse(GetProductsModel)
  @Get()
  async getProducts(@Query() productFilterDto: ProductFilterDto) {
    const { products, totalPages } =
      await this.productService.getAll(productFilterDto);

    return successResponse({ products, totalPages });
  }

  @Get('/filters')
  async getFilters(@Query() getFiltersDto: GetFiltersDto) {
    return await this.productService.getFilters(getFiltersDto);
  }

  @Get(':id')
  async getProduct(@Param('id') productId: number) {
    const product = await this.productService.get(productId);

    if (!product) throw new NotFoundException('Продукт не найден');

    return successResponse(product);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);

    return successResponse(product);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.productService.update(id, updateProductDto);

    return successResponse('Продукт успешно обновлен');
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.productService.delete(id);

    return successResponse('Продукт успешно удален');
  }
}
