import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService, ConfigType } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/all-exception.filter';
import { WinstonLogger } from './logger/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  const config = new DocumentBuilder().setTitle('SkillSwap').build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  app.useGlobalFilters(new AllExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // удаляет все свойства, которых нет в DTO с декораторами
      forbidNonWhitelisted: true, // выбрасывает ошибку, если есть лишние поля
      transform: true, // автоматически преобразует payload к типу DTO
    }),
  );

  const configService = app.get(ConfigService);
  const appCnfg = configService.get<ConfigType<typeof appConfig>>('app');

  const logger = app.get(WinstonLogger);
  logger.log(`Server started on port ${appCnfg?.port || 3000}`, 'Bootstrap');

  await app.listen(appCnfg?.port || 3000);
}
void bootstrap();
