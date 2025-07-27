import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { IAppConfig } from 'src/config/config.types';

export const acceptedImageTypes = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
];

export function createMulterConfig(config: IAppConfig): MulterOptions {
  return {
    storage: diskStorage({
      destination: config.upload.dir, //Берем из конфига папку, куда будем загружать файлы
      filename: (_req, file, cb) => {
        const uniqueName = uuidv4() + extname(file.originalname);
        cb(null, uniqueName);
      },
    }),
    limits: {
      fileSize: config.upload.fileSizeMax,
    },
    fileFilter: (_req, file, cb) => {
      if (!acceptedImageTypes.includes(file.mimetype)) {
        return cb(
          new HttpException('Ожидается изображение', HttpStatus.BAD_REQUEST),
          false,
        );
      }
      cb(null, true);
    },
  };
}
