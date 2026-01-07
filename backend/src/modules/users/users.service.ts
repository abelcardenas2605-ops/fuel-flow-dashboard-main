import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | undefined> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number): Promise<User | undefined> {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async create(data: any): Promise<User> {
        console.log('Creating user with data:', data);
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                password: data.password, // In real app, hash this!
                role: data.role ? data.role.toUpperCase() : 'CONSUMER',
                employeeId: data.employeeId || null,
            } as any,
        });
    }
    async findAll() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async update(id: number, data: any) {
        return this.prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                role: data.role ? data.role.toUpperCase() : undefined,
                employeeId: data.employeeId
            }
        });
    }

    async delete(id: number) {
        return this.prisma.user.delete({
            where: { id }
        });
    }
}
