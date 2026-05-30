import { IsString, IsNumber, Min } from 'class-validator';

export class ShippingCostDto {
  @IsString()
  toCity!: string;

  @IsNumber()
  @Min(0)
  totalWeightGr!: number;
}