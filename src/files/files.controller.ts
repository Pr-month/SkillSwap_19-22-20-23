import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadImageFile(
    @UploadedFile() file: { path: string; originalname: string },
  ) {
    return { filename: file.originalname, path: file.path };
  }
}
