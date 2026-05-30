import { IsString, IsIBAN, IsOptional, IsBoolean } from 'class-validator';

export class BankAccountDto {
  @IsIBAN()
  iban!: string;

  @IsString()
  cardNumber!: string;

  @IsString()
  accountHolderName!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}