import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createMulterConfig } from './files.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = {
          upload: {
            dir: configService.get<string>('upload.dir') || './uploads',
            fileSizeMax:
              configService.get<number>('upload.fileSizeMax') ||
              5 * 1024 * 1024, // дефолт 5 Мб
          },
        };
        return createMulterConfig(config);
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
