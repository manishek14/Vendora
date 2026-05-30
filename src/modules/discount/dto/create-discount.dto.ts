import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  code!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  percent!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCartAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}