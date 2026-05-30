import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsObject, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsNumber()
  categoryId!: number;

  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  dynamicAttributes?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isSpecial?: boolean;
}