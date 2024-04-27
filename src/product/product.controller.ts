import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { User } from 'src/iam/decorators/user.decorator';
import { ActiveUser } from 'src/iam/interfaces/active-user.interface';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth(AuthType.JWT)
  @Role('admin')
  @Get()
  getAll(@User() user: ActiveUser) {
    return 'products';
  }
}
