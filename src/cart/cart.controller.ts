import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { successResponse } from 'src/common/utils/apiResponse';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { User } from 'src/iam/decorators/user.decorator';
import { CartService } from './cart.service';
import { AddCartProductDto } from './dto/add-cart-product.dto';
import { CartFiltersDto } from './dto/cart-filters.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Auth(AuthType.JWT)
  @Get('')
  async getAll(
    @User('id') userId: number,
    @Query() cartFiltersDto: CartFiltersDto,
  ) {
    const { products, totalPages, totalDiscountedPrice, totalPrice } =
      await this.cartService.getAll(userId, cartFiltersDto);

    return successResponse({
      products,
      totalDiscountedPrice,
      totalPrice,
      totalPages,
    });
  }

  @Auth(AuthType.JWT)
  @Post('')
  async add(
    @User('id') userId: number,
    @Body() addCartProductDto: AddCartProductDto,
  ) {
    await this.cartService.add(userId, addCartProductDto);
    return successResponse('Товар добавлен в корзину');
  }

  @Auth(AuthType.JWT)
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCartProductDto: UpdateCartProductDto,
  ) {
    await this.cartService.update(id, updateCartProductDto);
    return successResponse('Товар успешно обновлен');
  }

  @Auth(AuthType.JWT)
  @Delete(':id')
  async deuserIdlete(@Param('id') id: number) {
    await this.cartService.delete(id);
    return successResponse('Товар удален из корзины');
  }
}
