import { IsString } from 'class-validator';

export class GithubSignInDto {
  @IsString({ message: 'Токен обязателен' })
  code: string;
}
