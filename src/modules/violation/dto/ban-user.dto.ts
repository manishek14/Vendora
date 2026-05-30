import { IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { BanType } from '../../../database/entities/user-ban.entity';

export class BanUserDto {
  @IsNumber()
  userId!: number;

  @IsIn([BanType.TEMPORARY, BanType.PERMANENT])
  punishmentType!: BanType;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsNumber()
  violationItemId?: number;
}