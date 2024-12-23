import { IsString, IsOptional } from 'class-validator';

export class UpdateConfessionDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;
}
