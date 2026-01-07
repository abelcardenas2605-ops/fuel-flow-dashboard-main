import { Controller, Post, Body, Get, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('shifts')
@ApiBearerAuth()
@Controller('shifts')
export class ShiftsController {
    constructor(private readonly shiftsService: ShiftsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('open')
    async openShift(@Req() req, @Body('openingAmount') openingAmount: number) {
        if (!openingAmount && openingAmount !== 0) {
            throw new BadRequestException('Opening amount is required');
        }
        return this.shiftsService.openShift(req.user.id, openingAmount);
    }

    @UseGuards(JwtAuthGuard)
    @Post('close')
    async closeShift(@Req() req, @Body('closingAmount') closingAmount: number) {
        if (!closingAmount && closingAmount !== 0) {
            throw new BadRequestException('Closing amount is required');
        }
        return this.shiftsService.closeShift(req.user.id, closingAmount);
    }

    @UseGuards(JwtAuthGuard)
    @Get('current')
    async getCurrentShift(@Req() req) {
        return this.shiftsService.getCurrentShift(req.user.id);
    }
}
