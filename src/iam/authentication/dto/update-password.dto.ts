import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Текущий пароль',
  })
  @IsString({ message: 'Укажите старый пароль' })
  oldPassword: string;

  @ApiProperty({
    description: 'Новый пароль',
  })
  @IsString({ message: 'Укажите новый пароль' })
  @MinLength(8, {
    message: 'Новый пароль должен содержать не менее 8 символов',
  })
  newPassword: string;
}
