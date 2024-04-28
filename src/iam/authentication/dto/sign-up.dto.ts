import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Не корректный эл. адрес' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Минимальная длина пароля 8 символов' })
  password: string;
}
