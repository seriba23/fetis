import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { UploadsController } from './uploads.controller';

const UPLOADS_ROOT = process.env.UPLOADS_DIR || join(process.cwd(), '..', '..', 'uploads');

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const raw = (req.params?.folder ?? req.body?.folder ?? 'misc') as string;
          const folder = String(raw).replace(/[^a-z0-9-_]/gi, '') || 'misc';
          const path = join(UPLOADS_ROOT, folder);
          mkdirSync(path, { recursive: true });
          cb(null, path);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        const ok = /^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype);
        if (!ok) return cb(new Error('Solo imágenes JPG, PNG, WebP, GIF'), false);
        cb(null, true);
      },
    }),
  ],
  controllers: [UploadsController],
})
export class UploadsModule {}
