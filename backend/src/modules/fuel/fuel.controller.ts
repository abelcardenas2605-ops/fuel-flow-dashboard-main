import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('fuels')
@Controller('fuels')
export class FuelController {
    constructor(private readonly fuelService: FuelService) { }

    @Get()
    findAll() {
        return this.fuelService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFuelDto: any) {
        return this.fuelService.update(+id, updateFuelDto);
    }
}
