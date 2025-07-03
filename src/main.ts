import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService, ConfigType } from '@nestjs/config';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appCnfg = configService.get<ConfigType<typeof appConfig>>('app');
  await app.listen(appCnfg?.port || 3000);
}
void bootstrap();
