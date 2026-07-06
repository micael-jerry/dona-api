import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function run() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port: number = configService.getOrThrow<number>('app.port');

  app.enableCors({
    origin: '*',
  });

  await app.listen(port);
  console.info(`API is running on: ${await app.getUrl()}`);
}

void run();
