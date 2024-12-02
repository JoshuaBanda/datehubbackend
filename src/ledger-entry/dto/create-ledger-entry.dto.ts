// src/ledger-account-entry/dto/create-ledger-entry.dto.ts

import { IsNotEmpty, IsEnum, IsInt, IsString } from 'class-validator';

export class CreateLedgerEntryDto {
  @IsEnum(['dr', 'cr'])
  @IsNotEmpty()
  type: string; // "dr" for debit, "cr" for credit
  
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  amount: number;

  @IsInt()
  @IsNotEmpty()
  ledgerAccountid: number; // ID of the ledger account to which this entry belongs
}
