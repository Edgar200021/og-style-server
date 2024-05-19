import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteCartProductDto {
  @ApiProperty({ description: 'ID товара в корзине ' })
  @IsNumber({}, { message: 'Должно быть целым числом' })
  cartProductId: number;
}
