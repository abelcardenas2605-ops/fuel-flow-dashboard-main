import { IsNumber, IsEnum, IsOptional, IsPositive } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateTransactionDto {
  @IsNumber()
  @IsPositive()
  fuelTypeId: number;

  @IsNumber()
  @IsPositive()
  volume: number;

  @IsNumber()
  @IsOptional()
  vehicleId?: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
