import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(6, 6)
  code!: string;

  @IsString()
  @Matches(/^09[0-9]{9}$/)
  phone!: string;
}