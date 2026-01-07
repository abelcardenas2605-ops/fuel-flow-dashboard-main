import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FuelService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.fuelType.findMany();
    }

    async findOne(id: number) {
        return this.prisma.fuelType.findUnique({
            where: { id },
        });
    }
    async update(id: number, data: any) {
        return this.prisma.fuelType.update({
            where: { id },
            data: {
                currentPrice: data.price, // Assuming frontend sends 'price' or 'stockLevel'
                stockLevel: data.stock,
            },
        });
    }
}
