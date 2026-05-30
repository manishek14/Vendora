import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  shippingAddressId!: number;

  @IsNumber()
  shippingMethodId!: number;

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWalletAmountToUse?: number;
}