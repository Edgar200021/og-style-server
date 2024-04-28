import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString({ message: 'Укажите старый пароль' })
  oldPassword: string;

  @IsString({ message: 'Укажите новый пароль' })
  @MinLength(8, {
    message: 'Новый пароль должен содержать не менее 8 символов',
  })
  newPassword: string;
}
