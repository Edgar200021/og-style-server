import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsHexColor,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { BaseFilter } from 'src/common/dto/base-filter.dto';

export class ProductFilterDto extends BaseFilter {
  @ApiProperty({
    description:
      'Название категории,должно быть один из значений одежда, обувь',
    required: false,
  })
  @IsOptional()
  @IsIn(['одежда', 'обувь'], {
    message: 'Должно быть один из значений  одежда, обувь',
  })
  category: string;

  @ApiProperty({
    description: 'Подкатегория продукта',
    required: false,
    example: 'кроссовки',
  })
  @IsOptional()
  @IsString({ message: 'Должно быть строкой' })
  subCategory: string;

  @ApiProperty({
    required: false,
    description: 'Размеры продукта через запятую',
    example: 'S,M,L,XL',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value.split(','))
  @IsNotEmpty({ each: true, message: 'Должно быть строкой' })
  @IsString({ message: 'Должно быть строкой', each: true })
  size: string[];

  @ApiProperty({
    description: 'Материалы продукта через запятую',
    example: 'замш,кожа',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value.split(','))
  @IsNotEmpty({ each: true, message: 'Должно быть строкой' })
  @IsString({ message: 'Должно быть строкой', each: true })
  material: string[];

  @ApiProperty({
    description: 'цвета продукта через запятую',
    example: '#fff,#000,#ccc',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value.split(','))
  @IsNotEmpty({ each: true, message: 'Должно быть формата HEX' })
  @IsHexColor({ each: true, message: 'Должно быть формата HEX' })
  colors: string[];

  @ApiProperty({
    description:
      'Бренд продукта через запятую, должно быть один из значений nike, adidas, the north face, puma, new balance, jordan',
    example: 'nike,adidas,the north face',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value.split(','))
  @IsIn(['nike', 'adidas', 'the north face', 'puma', 'new balance', 'jordan'], {
    each: true,
    message:
      'Должно быть один из значений  nike, adidas, the north face, puma, new balance, jordan',
  })
  brand: string[];

  @ApiProperty({
    description: 'Минимальная цена продукта',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsPositive({ message: 'Должно быть положительным числом' })
  @IsNumber({}, { message: 'Должно быть числом' })
  minPrice: number;

  @ApiProperty({
    description: 'Максимальная цена продукта',
    example: 20000,
    required: false,
  })
  @IsOptional()
  @IsPositive({ message: 'Должно быть положительным числом' })
  @IsNumber({}, { message: 'Должно быть числом' })
  maxPrice: number;
}
