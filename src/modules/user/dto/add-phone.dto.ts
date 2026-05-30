import { IsString, Matches } from 'class-validator';

export class AddPhoneDto {
  @IsString()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل باید با 09 شروع و 11 رقم باشد' })
  phone!: string;
}