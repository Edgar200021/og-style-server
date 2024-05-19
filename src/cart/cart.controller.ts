import { Body, Controller, Query } from '@nestjs/common';
import { successResponse } from 'src/common/utils/apiResponse';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { User } from 'src/iam/decorators/user.decorator';
import { CartService } from './cart.service';
import { AddCartProductDto } from './dto/add-cart-product.dto';
import { CartFiltersDto } from './dto/cart-filters.dto';
import { DeleteCartProductDto } from './dto/delete-cart-product.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';

@Auth(AuthType.JWT)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  async getAll(
    @User('id') userId: number,
    @Query() cartFiltersDto: CartFiltersDto,
  ) {
    const { products, totalPages } = await this.cartService.getAll(
      userId,
      cartFiltersDto,
    );

    return successResponse({
      products: products.map((product) => ({
        id: product.id,
        quantity: product.quantity,
        size: product.size,
        color: product.color,
      })),
      totalPages,
    });
  }

  async add(
    @User('id') userId: number,
    @Body() addCartProductDto: AddCartProductDto,
  ) {
    await this.cartService.add(userId, addCartProductDto);
    return successResponse('Товар добавлен в корзину');
  }

  async update(
    @User('id') userId: number,
    @Body() updateCartProductDto: UpdateCartProductDto,
  ) {
    await this.cartService.update(userId, updateCartProductDto);
    return successResponse('Товар успешно обновлен');
  }

  async delete(
    @User('id') userId: number,
    @Body() deleteCartProductDto: DeleteCartProductDto,
  ) {
    await this.cartService.delete(userId, deleteCartProductDto);
    return successResponse('Товар удален из корзины');
  }
}
