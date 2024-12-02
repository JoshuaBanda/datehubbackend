import { Module } from '@nestjs/common';
import { LedgerAccountEntryController } from './ledger-entry.controller';
import { LedgerAccountEntryService } from './ledger-entry.service';

@Module({
  controllers: [LedgerAccountEntryController],
  providers: [LedgerAccountEntryService],
})
export class LedgerEntryModule {}
