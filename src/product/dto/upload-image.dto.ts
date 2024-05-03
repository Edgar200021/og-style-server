import { ApiProperty } from '@nestjs/swagger';

export class UploadProductImagesDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    isArray: true,
  })
  file: Express.Multer.File;
}
