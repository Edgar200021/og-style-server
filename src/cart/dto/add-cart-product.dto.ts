import { ApiProperty } from '@nestjs/swagger';
import {
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddCartProductDto {
  @ApiProperty({ description: 'ID продукта' })
  @IsNumber({}, { message: 'Должно быть целым числом' })
  productId: number;

  @ApiProperty({
    description: 'Количество товара в корзине',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Должно быть целым числом' })
  @Min(1, { message: 'Минимальное количество 1' })
  quantity?: number;

  @ApiProperty({ description: 'Цвет товара' })
  @IsHexColor({ message: 'Неверный формат цвета' })
  color: string;

  @ApiProperty({ description: 'Размер товара' })
  @IsNotEmpty({ message: 'Размер не должен быть пустым' })
  @IsString({ message: 'Должно быть строкой' })
  size: string;
}
