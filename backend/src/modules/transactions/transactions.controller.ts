import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.CASHIER, Role.CONSUMER) // Anyone can buy, context differs
    async create(@Request() req, @Body() createTransactionDto: CreateTransactionDto) {
        // req.user comes from JWT Strategy
        return this.transactionsService.createTransaction(req.user.id, createTransactionDto);
    }

    @Get('history')
    async getHistory(@Request() req) {
        return this.transactionsService.getHistory(req.user.id);
    }

    @Get('admin/stats')
    @Roles(Role.ADMIN)
    async getAdminStats() {
        return this.transactionsService.getAdminStats();
    }

    @Get()
    @Roles(Role.ADMIN)
    async findAll() {
        return this.transactionsService.findAll();
    }
}
