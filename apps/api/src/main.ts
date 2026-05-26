import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
        'http://localhost:4000',
      ],
      credentials: true,
    },
    logger: ['error', 'warn', 'log'],
  });

  // Servir uploads como estáticos sin fallback de SPA.
  // En prod (pm2 cwd=apps/api) y en dev (turbo cwd=apps/api),
  // process.cwd()/../../uploads apunta al directorio del root del monorepo.
  // UPLOADS_PREFIX permite servir bajo /muebleria/uploads/ en deploys
  // que viven detrás de un subpath (ej. ingenieroibarra.com/muebleria).
  const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), '..', '..', 'uploads');
  const UPLOADS_PREFIX = process.env.UPLOADS_PREFIX || '/uploads/';
  app.useStaticAssets(UPLOADS_DIR, {
    prefix: UPLOADS_PREFIX,
    index: false,
    fallthrough: true,
  });

  // API_GLOBAL_PREFIX permite montar las rutas bajo /muebleria/api en demos
  // (default 'api'). Importante: no incluir el slash inicial.
  app.setGlobalPrefix(process.env.API_GLOBAL_PREFIX || 'api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.API_PORT || '4001', 10);
  await app.listen(port);
  Logger.log(`🚀 Fetis API corriendo en http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
