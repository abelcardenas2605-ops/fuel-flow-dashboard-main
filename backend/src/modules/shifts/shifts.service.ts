import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShiftStatus } from '@prisma/client';

@Injectable()
export class ShiftsService {
    constructor(private prisma: PrismaService) { }

    async openShift(userId: number, startCash: number) {
        // Check if user already has an open shift
        const existingShift = await this.prisma.shift.findFirst({
            where: { userId, status: ShiftStatus.OPEN },
        });

        if (existingShift) {
            throw new BadRequestException('User already has an open shift.');
        }

        return this.prisma.shift.create({
            data: {
                userId,
                startCash,
                startTime: new Date(),
                status: ShiftStatus.OPEN,
            },
        });
    }

    async closeShift(userId: number, endCash: number) {
        const activeShift = await this.prisma.shift.findFirst({
            where: { userId, status: ShiftStatus.OPEN },
        });

        if (!activeShift) {
            throw new BadRequestException('No open shift found for this user.');
        }

        // Verify totals (simple check, in real app more complex reconciliation)
        // theoreticalCash = startCash + totalSales
        const theoreticalCash = Number(activeShift.startCash) + Number(activeShift.totalSales);
        const difference = endCash - theoreticalCash;

        return this.prisma.shift.update({
            where: { id: activeShift.id },
            data: {
                endTime: new Date(),
                endCash: endCash,
                status: ShiftStatus.CLOSED,
                // We could log the 'difference' in a separate report table or field if needed
            },
        });
    }
    async getCurrentShift(userId: number) {
        return this.prisma.shift.findFirst({
            where: { userId, status: ShiftStatus.OPEN },
            include: { user: true },
        });
    }
}
