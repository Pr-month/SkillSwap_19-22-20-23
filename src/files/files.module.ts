import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { createMulterConfig } from './files.config';
import { appConfig } from 'src/config/app.config';
import { IAppConfig } from 'src/config/config.types';

@Module({
  // imports: [
  //   ConfigModule.forRoot(),
  //   MulterModule.registerAsync({
  //     imports: [ConfigModule],
  //     inject: [ConfigService],
  //     useFactory: (configService: ConfigService) => {
  //       const config = {
  //         upload: {
  //           dir: configService.get<string>('upload.dir') || './uploads',
  //           fileSizeMax:
  //             configService.get<number>('upload.fileSizeMax') ||
  //             5 * 1024 * 1024, // дефолт 5 Мб
  //         },
  //       };
  //       return createMulterConfig(config);
  //     },
  //   }),
  // ],
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [appConfig.KEY],
      useFactory: (config: IAppConfig) => createMulterConfig(config),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
