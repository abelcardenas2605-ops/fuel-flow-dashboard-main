import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TransactionsController } from './modules/transactions/transactions.controller';
import { AppController } from './app.controller';
import { TransactionsService } from './modules/transactions/transactions.service';
import { ShiftsService } from './modules/shifts/shifts.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ShiftsModule } from './modules/shifts/shifts.module';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        VehiclesModule,
        FuelModule,
        FuelModule,
        NotificationsModule,
        ShiftsModule
    ],
    controllers: [
        AppController,
        TransactionsController,
        // UsersController,
        // ShiftsController
    ],
    providers: [
        TransactionsService,
        PrismaService,
        // {
        //   provide: APP_GUARD,
        //   useClass: JwtAuthGuard, // If global
        // },
    ],
})
export class AppModule { }
