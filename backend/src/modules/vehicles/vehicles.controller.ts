import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    @Post()
    create(@Request() req, @Body() createVehicleDto: CreateVehicleDto) {
        return this.vehiclesService.create(req.user.id, createVehicleDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.vehiclesService.findAllByUser(req.user.id);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.vehiclesService.delete(req.user.id, id);
    }
}
