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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from 'src/common/swagger/apiSuccessResponse';
import { GetProductsModel } from 'src/common/swagger/models/get-products-model.class';
import { GetProductFilters } from 'src/common/swagger/models/product-filters-model.class';
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

  @ApiOperation({ summary: 'Получить список продуктов' })
  @ApiSuccessResponse(GetProductsModel)
  @Get()
  async getProducts(@Query() productFilterDto: ProductFilterDto) {
    const { products, totalPages } =
      await this.productService.getAll(productFilterDto);

    return successResponse({ products, totalPages });
  }

  @ApiOperation({ summary: 'Получить фильтры для продуктов' })
  @ApiSuccessResponse(GetProductFilters)
  @Get('/filters')
  async getFilters(@Query() getFiltersDto: GetFiltersDto) {
    const filters = await this.productService.getFilters(getFiltersDto);

    return successResponse(filters);
  }

  @ApiOperation({ summary: 'Получить продукт по ID' })
  @Get(':id')
  async getProduct(@Param('id') productId: number) {
    const product = await this.productService.get(productId);

    if (!product) throw new NotFoundException('Продукт не найден');

    return successResponse(product);
  }

  @ApiOperation({ summary: 'Создать продукт ' })
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);

    return successResponse(product);
  }

  @ApiOperation({ summary: 'Обновить продукт' })
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    await this.productService.update(id, updateProductDto);

    return successResponse('Продукт успешно обновлен');
  }

  @ApiOperation({ summary: 'Удалить продукт' })
  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.productService.delete(id);

    return successResponse('Продукт успешно удален');
  }
}
