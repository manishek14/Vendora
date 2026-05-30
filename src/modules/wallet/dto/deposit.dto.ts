import { IsNumber, Min, Max, IsIn } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(10000)
  @Max(50000000)
  amount!: number;

  @IsIn(['zarinpal', 'pasargad'])
  gateway!: 'zarinpal' | 'pasargad';
}