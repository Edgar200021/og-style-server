import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Эл.почта пользователя',
  })
  @IsEmail({}, { message: 'Не корректный эл. адрес' })
  email: string;

  @ApiProperty({
    example: 'password',
    description: 'Пароль пользователя',
  })
  @IsString()
  @MinLength(8, { message: 'Минимальная длина пароля 8 символов' })
  password: string;
}
