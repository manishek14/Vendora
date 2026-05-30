import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل نامعتبر است' })
  phone!: string;
}