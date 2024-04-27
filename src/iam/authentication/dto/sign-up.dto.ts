import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: 'Не корректный эл. адрес' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'пароль Должно быть более 8 символов' })
  password: string;
}
