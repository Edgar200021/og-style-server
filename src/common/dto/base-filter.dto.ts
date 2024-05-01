import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class BaseFilter {
  @ApiProperty({
    description:
      'Количество получаемых элементов при запросе, по умолчанию равно 8. Можно указать больше, если необходимо',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'должен быть числом' })
  @IsPositive({ message: 'Должен быть больше нуля' })
  limit: number;

  @ApiProperty({
    description: 'Номер страницы для пагинации, по умолчанию равен 1',
    required: false,
  })
  @IsOptional()
  @IsPositive({ message: 'Должен быть больше нуля' })
  @IsPositive({ message: 'Должен быть больше нуля' })
  page: number;
}
