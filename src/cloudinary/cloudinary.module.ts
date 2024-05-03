import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

import { ConfigModule, ConfigType } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import cloudinaryConfig from './config/cloudinary.config';

const CLOUDINARY_TOKEN = 'cloudinary';

@Module({
  imports: [ConfigModule.forFeature(cloudinaryConfig)],
  providers: [
    CloudinaryService,
    {
      provide: CLOUDINARY_TOKEN,
      useFactory: (
        cloudinaryConfiguration: ConfigType<typeof cloudinaryConfig>,
      ) => cloudinary.config(cloudinaryConfiguration),
      inject: [cloudinaryConfig.KEY],
    },
  ],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
