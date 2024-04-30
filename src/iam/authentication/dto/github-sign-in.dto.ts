import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GithubSignInDto {
  @ApiProperty({
    description: 'код, полученный после редиректа из GitHub(на клиенте)',
  })
  @IsString({ message: 'Токен обязателен' })
  code: string;
}
