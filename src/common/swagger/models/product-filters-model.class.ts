import { ApiProperty } from '@nestjs/swagger';

export class GetProductFilters {
  @ApiProperty({ description: 'Размеры продуктов', example: ['S', 'M'] })
  size: string[];

  @ApiProperty({ description: 'Цвета продуктов', example: ['#fff', '#000'] })
  colors: string[];

  @ApiProperty({ description: 'Минимальная цена продуктов' })
  min_price: number;

  @ApiProperty({ description: ' Максимальная цена продуктов' })
  max_price: number;

  @ApiProperty({
    description: 'Бренды продуктов',
    isArray: true,
    enum: ['nike', 'adidas', 'the north face', 'puma', 'new balance', 'jordan'],
  })
  brands: string[];
}
