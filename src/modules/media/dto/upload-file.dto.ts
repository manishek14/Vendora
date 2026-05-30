import { IsOptional, IsBoolean } from 'class-validator';

export class UploadFileDto {
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}