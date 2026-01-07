import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum VehicleType {
    CAR = 'CAR',
    MOTORCYCLE = 'MOTORCYCLE',
    TRUCK = 'TRUCK',
    BUS = 'BUS',
    OTHER = 'OTHER',
}

export class CreateVehicleDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    plate: string;

    @ApiProperty({ enum: VehicleType })
    @IsEnum(VehicleType)
    type: VehicleType;

    @ApiProperty()
    @IsNumber()
    tankCapacity: number;
}
