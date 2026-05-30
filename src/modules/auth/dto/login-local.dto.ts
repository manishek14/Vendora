import { IsEmail, IsString } from 'class-validator';

export class LoginLocalDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}