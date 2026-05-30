import { IsString, IsOptional, IsNumber } from 'class-validator';

export class InternalNotificationDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  data?: string;
}