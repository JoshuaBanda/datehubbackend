import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLedgerEntryDto {
  @IsOptional()  // Optional, as it might not be provided during update
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  ledgerAccountid?: number;
}
