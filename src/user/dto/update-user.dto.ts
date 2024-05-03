import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Не корректный эл. адрес' })
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  avatar: string;
}
