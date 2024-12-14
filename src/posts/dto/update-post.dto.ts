import { IsString, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;
}
