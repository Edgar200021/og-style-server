import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Токен, полученный после редиректа из почты',
  })
  @IsString({ message: 'Токен обязателен' })
  token: string;

  @ApiProperty({
    description: 'Эл.адрес, полученный после редиректа из почты',
  })
  @IsEmail({}, { message: 'Некорректная эл.почта' })
  email: string;

  @ApiProperty({
    description: 'Новый пароль',
  })
  @IsString({ message: 'Новый пароль обязателен' })
  @MinLength(8, { message: 'Минимальная длина пароля 8 символов' })
  password: string;
}
