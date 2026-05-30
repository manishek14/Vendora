import { IsNumber, Min } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(10000)
  amount!: number;

  @IsNumber()
  bankAccountId!: number;
}