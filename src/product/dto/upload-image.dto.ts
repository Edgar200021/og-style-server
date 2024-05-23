import { ApiProperty } from '@nestjs/swagger';
//eslint-disable-next-line
import { Multer } from 'multer';

export class UploadProductImagesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    isArray: true,
  })
  file: Express.Multer.File;
}
