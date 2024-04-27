import { Controller, Get, UseGuards } from '@nestjs/common';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { Role } from 'src/iam/authorization/decorators/role.decorator';
import { RoleGuard } from 'src/iam/authorization/guards/role.guard';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth(AuthType.JWT)
//  @Role('admin')
  @UseGuards(RoleGuard)
  @Get()
  getAll() {
    return 'products';
  }
}
