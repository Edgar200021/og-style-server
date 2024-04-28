import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Токен обязателен' })
  token: string;

  @IsEmail({}, { message: 'Некорректная эл.почта' })
  email: string;

  @IsString({ message: 'Новый пароль обязателен' })
  @MinLength(8, { message: 'Минимальная длина пароля 8 символов' })
  password: string;
}
