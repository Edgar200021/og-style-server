import { Controller, Query } from '@nestjs/common';
import { successResponse } from 'src/common/utils/apiResponse';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { User } from 'src/iam/decorators/user.decorator';
import { CartService } from './cart.service';
import { CartFiltersDto } from './dto/cart-filters.dto';

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
}
