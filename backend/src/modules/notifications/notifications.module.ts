import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Global() // Make it global so TransactionsModule can use it easily without imports hell
@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PrismaService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
