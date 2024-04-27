import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Не корректный эл. адрес' })
  email: string;

  @IsString()
  password: string;
}
