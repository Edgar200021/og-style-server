import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Эл.адрес пользователя',
    example: 'test@gmail.com',
  })
  @IsEmail({}, { message: 'Некорректная эл.почта' })
  email: string;
}
