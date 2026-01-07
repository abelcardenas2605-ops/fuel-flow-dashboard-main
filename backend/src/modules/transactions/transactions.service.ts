import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async createTransaction(userId: number, dto: CreateTransactionDto) {
        // 1. Validate Active Shift (if required by business rule, usually for cash payments)
        // For specific requirement "Shift must be open for sales"
        const activeShift = await this.prisma.shift.findFirst({
            where: { userId: userId, status: 'OPEN' }, // Or check global shift depending on logic
        });

        // Note: If consumer self-service, maybe no shift needed, but for "Caja" module it is.
        // We will assume "Cashier" flow for this example or check if user is consumer.

        // 2. Check Fuel Inventory and Price
        const fuel = await this.prisma.fuelType.findUnique({
            where: { id: dto.fuelTypeId },
        });

        if (!fuel) throw new NotFoundException('Fuel type not found');
        if (fuel.stockLevel.toNumber() < dto.volume) {
            throw new BadRequestException('Insufficient fuel inventory');
        }

        // 3. Calculate Total (in case frontend sends it, verified here)
        // Using simple multiplication for robustness
        const pricePerUnit = fuel.currentPrice;
        const calculatedTotal = Number(pricePerUnit) * dto.volume;

        // 4. Create Transaction & Update Inventory in Transaction
        return this.prisma.$transaction(async (tx) => {
            // Deduct Inventory
            await tx.fuelType.update({
                where: { id: dto.fuelTypeId },
                data: {
                    stockLevel: {
                        decrement: dto.volume,
                    },
                },
            });

            // Create Record
            const transaction = await tx.transaction.create({
                data: {
                    userId,
                    shiftId: activeShift ? activeShift.id : null, // Link to shift if exists
                    vehicleId: dto.vehicleId,
                    fuelTypeId: dto.fuelTypeId,
                    volume: dto.volume,
                    pricePerUnit: pricePerUnit,
                    totalAmount: calculatedTotal,
                    paymentMethod: dto.paymentMethod,
                    status: TransactionStatus.COMPLETED, // Assuming instant payment for this flow
                },
            });

            // Update Shift Total if applicable
            if (activeShift) {
                await tx.shift.update({
                    where: { id: activeShift.id },
                    data: {
                        totalSales: {
                            increment: calculatedTotal,
                        },
                        // Update cash balance if cash payment
                        ...(dto.paymentMethod === PaymentMethod.CASH && {
                            // endCash is usually updated at closing, but we can track 'currentCash' if we added that field
                        })
                    },
                });
            }

            return transaction;
        });
    }

    async getHistory(userId: number) {
        return this.prisma.transaction.findMany({
            where: { userId },
            include: { fuelType: true, vehicle: true },
            orderBy: { timestamp: 'desc' },
        });
    }

    async getAdminStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [todaySalesAgg, todayCount, recentTransactions, lowStockFuels, topFuelAgg] = await Promise.all([
            // 1. Today's Sales
            this.prisma.transaction.aggregate({
                _sum: { totalAmount: true },
                where: { timestamp: { gte: today } },
            }),
            // 2. Today's Transaction Count
            this.prisma.transaction.count({
                where: { timestamp: { gte: today } },
            }),
            // 3. Recent Transactions
            this.prisma.transaction.findMany({
                take: 5,
                orderBy: { timestamp: 'desc' },
                include: { fuelType: true, user: true },
            }),
            // 4. Low Stock Fuels (< 1000 liters/units as example threshold or dynamic)
            // Assuming stockLevel is Decimal
            this.prisma.fuelType.findMany({
                where: { stockLevel: { lt: 2000 } }, // Threshold example
                orderBy: { stockLevel: 'asc' }
            }),
            // 5. Top Fuel (Simplified: just count by fuelType group by)
            this.prisma.transaction.groupBy({
                by: ['fuelTypeId'],
                _sum: { volume: true },
                orderBy: { _sum: { volume: 'desc' } },
                take: 1,
            })
        ]);

        let topFuelName = 'N/A';
        if (topFuelAgg.length > 0) {
            const tf = await this.prisma.fuelType.findUnique({ where: { id: topFuelAgg[0].fuelTypeId } });
            topFuelName = tf ? tf.name : 'Unknown';
        }

        return {
            todaySales: todaySalesAgg._sum.totalAmount || 0,
            totalTransactions: todayCount,
            avgTicket: todayCount > 0 ? (Number(todaySalesAgg._sum.totalAmount) / todayCount) : 0,
            pendingPayments: 0, // Placeholder if no logic for pending
            recentSales: recentTransactions.map(t => ({
                id: t.id,
                fuel: t.fuelType.name,
                liters: t.volume,
                amount: t.totalAmount,
                time: t.timestamp,
                method: t.paymentMethod,
                user: t.user.name,
            })),
            lowStockFuels: lowStockFuels.map(f => ({
                id: f.id,
                name: f.name,
                stockLevel: f.stockLevel,
            })),
            topFuel: topFuelName,
        };
    }

    async findAll() {
        return this.prisma.transaction.findMany({
            orderBy: { timestamp: 'desc' },
            include: { user: true, fuelType: true, vehicle: true }
        });
    }
}
