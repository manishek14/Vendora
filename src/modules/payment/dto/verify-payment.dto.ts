import { IsString, IsOptional, IsIn } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  authority!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsString()
  @IsIn(['zarinpal', 'pasargad'])
  gateway!: 'zarinpal' | 'pasargad';
}