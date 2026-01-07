import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: number, dto: CreateVehicleDto) {
        return this.prisma.vehicle.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async findAllByUser(userId: number) {
        return this.prisma.vehicle.findMany({
            where: { userId },
        });
    }

    async delete(userId: number, vehicleId: number) {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        if (vehicle.userId !== userId) {
            throw new ForbiddenException('You do not own this vehicle');
        }

        return this.prisma.vehicle.delete({
            where: { id: vehicleId },
        });
    }
}
