import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 'مشکل در پرداخت' })
  @IsNotEmpty({ message: 'عنوان نباید خالی باشد!' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'سفارش من پرداخت شد ولی ثبت نشد' })
  @IsNotEmpty({ message: 'موضوع نباید خالی باشد!' })
  @IsString()
  subject: string;

  @ApiPropertyOptional({ example: 'توضیحات بیشتر...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  replyTo?: number;
}
