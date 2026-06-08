import { Module } from '@nestjs/common';
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
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
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
