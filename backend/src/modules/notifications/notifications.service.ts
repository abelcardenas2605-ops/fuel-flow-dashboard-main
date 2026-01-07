import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, title: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: number, userId: number) {
    // Ideally verify user ownership
    return this.prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true }
    });
  }
}
