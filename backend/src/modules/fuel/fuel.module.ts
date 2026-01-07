import { Module } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [FuelController],
    providers: [FuelService, PrismaService],
    exports: [FuelService],
})
export class FuelModule { }
