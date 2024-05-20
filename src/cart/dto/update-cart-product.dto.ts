import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartProductDto {
  @ApiProperty({ description: 'Количество товара в корзине' })
  @IsNumber({}, { message: 'Должно быть целым числом' })
  @Min(1, { message: 'Минимальное количество 1' })
  quantity: number;
}
