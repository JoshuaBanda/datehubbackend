// create-ledger.dto.ts
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateLedgerDto {
  @IsString()
  @IsNotEmpty()
  itemname: string;

  @IsString()
  @IsNotEmpty()
  transactor: string;

  @IsEnum(['income ledger', 'expense ledger'])
  @IsNotEmpty()
  type: string;
}
