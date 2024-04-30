import { IsEmail, IsOptional, IsString } from 'class-validator';
import { HasMimeType, IsFile, MaxFileSize } from 'nestjs-form-data';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Не корректный эл. адрес' })
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsFile()
  @MaxFileSize(1e6)
  @HasMimeType(['image/jpeg', 'image/png'])
  avatar: string;
}
