import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RegisterViolationDto {
  @IsNumber()
  violationItemId!: number;

  @IsOptional()
  @IsString()
  description?: string;
}