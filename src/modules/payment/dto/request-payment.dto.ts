import { IsNumber, IsString, IsIn } from 'class-validator';

export class RequestPaymentDto {
  @IsNumber()
  orderId!: number;

  @IsString()
  @IsIn(['zarinpal', 'pasargad'])
  gateway!: 'zarinpal' | 'pasargad';
}