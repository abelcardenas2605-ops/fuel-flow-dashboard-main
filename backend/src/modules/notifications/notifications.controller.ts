import { Controller, Get, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
