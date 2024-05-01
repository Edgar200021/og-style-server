import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class GetFiltersDto {
  @ApiProperty({
    description:
      'Категория продукта, должно быть один из значений одежда, обувь',
  })
  @IsIn(['одежда', 'обувь'], {
    message: 'Должно быть один из значений  одежда, обувь',
  })
  category: string;
}
