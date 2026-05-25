import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
        'http://localhost:4000',
      ],
      credentials: true,
    },
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.API_PORT || '4001', 10);
  await app.listen(port);
  Logger.log(`🚀 Fetis API corriendo en http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
