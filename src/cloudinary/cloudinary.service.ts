import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from './config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(cloudinaryConfig.KEY)
    private readonly cloudinaryConfiguration: ConfigType<
      typeof cloudinaryConfig
    >,
  ) {}

  async upload(file: Express.Multer.File | Express.Multer.File[]) {
    if (Array.isArray(file)) {
      const res = await Promise.all(
        file.map(async (f) => {
          console.log(f.path);
          return this.uploadFile(f);
        }),
      );

      return res;
    }

    return this.upload(file);
  }

  private async uploadFile(file: Express.Multer.File) {
    try {
      const res = await cloudinary.uploader.upload(file.path, {
        use_filename: true,
        folder: this.cloudinaryConfiguration.folder,
      });

      return res.secure_url;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(
        'Произошла ошибка при загрузке файла',
      );
    }
  }
}
