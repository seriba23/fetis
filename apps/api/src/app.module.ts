import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { FurnitureTypesModule } from './modules/furniture-types/furniture-types.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { GalleryModule } from './modules/gallery/gallery.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PublicModule } from './modules/public/public.module';
import { SettingsModule } from './modules/settings/settings.module';

// Path absoluto al directorio uploads. En prod con PM2 cwd=apps/api,
// process.cwd() es /home/<dominio>/fetis/apps/api, '..', '..', 'uploads'
// resuelve al uploads del root del monorepo. En dev (turbo) cwd también
// es apps/api. Permite override absoluto via env.
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(process.cwd(), '..', '..', 'uploads');

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_DIR,
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    AppointmentsModule,
    FurnitureTypesModule,
    QuotesModule,
    PaymentsModule,
    ExpensesModule,
    GalleryModule,
    DashboardModule,
    UploadsModule,
    PublicModule,
    SettingsModule,
  ],
})
export class AppModule {}
