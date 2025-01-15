import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessDto } from './create-business.dto';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
    
      @IsString()
      @IsOptional()
      description?: string;
    
      @IsString()
      @IsOptional()
      photo_url?: string;

      @IsNumber()
      business_id:number;
}
