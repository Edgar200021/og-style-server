import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsHexColor,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Название продукта,длина не больше 60 символов',
  })
  @IsString({ message: 'Должно быть строкой' })
  @MaxLength(60, { message: 'должно быть меньше или равно 60 символов' })
  name: string;

  @ApiProperty({
    description: 'Описание продукта,длина не больше 1000 символов',
  })
  @IsString({ message: 'Должно быть строкой' })
  @MaxLength(1000, { message: 'должно быть меньше или равно 20 символов' })
  description: string;

  @ApiProperty({
    description: 'Цена продукта, не меньше чем 1000',
  })
  @IsNumber({}, { message: 'Должно быть числом' })
  @Min(1000, { message: 'Минимальное значение 1000' })
  price: number;

  @ApiProperty({
    description: 'Скидка продукта в процентах(%), в диапазоне от 1 до 99',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Должно быть числом' })
  @Min(1, { message: 'Минимальное значение 1' })
  @Max(99, { message: 'Максимальное значение 99' })
  discount?: number;

  @ApiProperty({
    description:
      'Категория продукта, должно быть один из значений одежда, обувь',
  })
  @IsIn(['одежда', 'обувь'], {
    message: 'Должно быть один из значений  одежда, обувь',
  })
  category: string;

  @ApiProperty({
    description: 'Подкатегория продукта',
  })
  @IsString({ message: 'Должно быть строкой' })
  subCategory: string;

  @ApiProperty({
    description:
      'Картинки продукта в виде массива из url(ссылка на картинку) длиной 4,',
  })
  @IsUrl({}, { each: true, message: 'Картинки должны быть в виде url' })
  @ArrayMinSize(4, { message: 'Минимальное количество картинок 4' })
  @ArrayMaxSize(4, { message: 'Максимальное количество картинок 4' })
  images: string[];

  @ApiProperty({
    description: 'Размер продукта в виде массива',
    type: [String],
  })
  @ArrayNotEmpty({ message: 'Минимальное количество размеров 1' })
  @IsString({ each: true, message: 'Должно быть строкой' })
  @Transform(({ value }: TransformFnParams) => value.map((v) => v?.trim()))
  @IsNotEmpty({ each: true, message: 'Минимальное количество размеров 1' })
  size: string[];

  @ApiProperty({
    description: 'Материалы продукта в виде массива',
  })
  @ArrayNotEmpty({ message: 'Минимальное количество материалов 1' })
  @IsString({ each: true, message: 'Должно быть строкой' })
  @Transform(({ value }: TransformFnParams) => value.map((v) => v?.trim()))
  @IsNotEmpty({ each: true, message: 'Минимальное количество материалов 1' })
  materials: string[];

  @ApiProperty({
    description: 'Цвета продукта в виде массива из HEX',
  })
  @ArrayNotEmpty({ message: 'Минимальное количество цветов 1' })
  @IsHexColor({ each: true, message: 'Цвета должны быть в формате HEX' })
  colors: string[];

  @ApiProperty({
    description:
      'Бренд продукта, должно быть один из значений  Nike, adidas, the north face, puma, new balance, jordan',
  })
  @IsIn(['nike', 'adidas', 'the north face', 'puma', 'new balance', 'jordan'], {
    message:
      'Должно быть один из значений  nike, adidas, the north face, puma, new balance, jordan',
  })
  brand: string;
}
