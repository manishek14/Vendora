import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateViolationItemDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsNumber()
  categoryId!: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsIn(['warning', 'temporary', 'permanent'])
  defaultPunishmentType?: string;

  @IsOptional()
  @IsNumber()
  defaultDurationDays?: number;
}