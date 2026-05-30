import { IsString, Matches, IsOptional } from 'class-validator';

export class SendSmsDto {
  @IsString()
  @Matches(/^09[0-9]{9}$/)
  to!: string;

  @IsString()
  templateId!: string;

  @IsOptional()
  params?: Record<string, string>;
}