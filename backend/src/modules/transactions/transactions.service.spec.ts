import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentMethod, TransactionStatus } from '@prisma/client';

const mockPrismaService = {
    activeShift: null, // Internal mock state
    fuelType: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    shift: {
        findFirst: jest.fn(),
        update: jest.fn(),
    },
    transaction: {
        create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('TransactionsService', () => {
    let service: TransactionsService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTransaction', () => {
        const userId = 1;
        const dto = {
            fuelTypeId: 1,
            volume: 10,
            paymentMethod: PaymentMethod.CASH,
            vehicleId: 1
        };

        it('should create a transaction successfully', async () => {
            // Setup Mocks
            mockPrismaService.shift.findFirst.mockResolvedValue({ id: 1 }); // Active Shift
            mockPrismaService.fuelType.findUnique.mockResolvedValue({
                id: 1,
                stockLevel: { toNumber: () => 100 }, // Sufficient stock
                currentPrice: 5.0,
            });
            mockPrismaService.transaction.create.mockResolvedValue({
                id: 1,
                ...dto,
                status: TransactionStatus.COMPLETED
            });

            // Execute based on logic: 10 units * $5.00 = $50.00
            const result = await service.createTransaction(userId, dto);

            // Verify
            expect(mockPrismaService.fuelType.findUnique).toHaveBeenCalledWith({ where: { id: dto.fuelTypeId } });
            // Inventory should decrease
            expect(mockPrismaService.fuelType.update).toHaveBeenCalledWith({
                where: { id: dto.fuelTypeId },
                data: { stockLevel: { decrement: dto.volume } },
            });
            // Transaction should be created
            expect(mockPrismaService.transaction.create).toHaveBeenCalled();
            expect(result).toHaveProperty('id', 1);
            expect(result).toHaveProperty('status', TransactionStatus.COMPLETED);
        });

        it('should throw BadRequestException if insufficient fuel', async () => {
            mockPrismaService.shift.findFirst.mockResolvedValue({ id: 1 });
            mockPrismaService.fuelType.findUnique.mockResolvedValue({
                id: 1,
                stockLevel: { toNumber: () => 5 }, // Less than requested 10
                currentPrice: 5.0,
            });

            await expect(service.createTransaction(userId, dto))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw NotFoundException if fuel type not found', async () => {
            mockPrismaService.shift.findFirst.mockResolvedValue({ id: 1 });
            mockPrismaService.fuelType.findUnique.mockResolvedValue(null);

            await expect(service.createTransaction(userId, dto))
                .rejects
                .toThrow(NotFoundException);
        });
    });
});
