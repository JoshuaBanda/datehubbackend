import { Test, TestingModule } from '@nestjs/testing';
import { LedgerAccountEntryService } from './ledger-entry.service';

describe('LedgerEntryService', () => {
  let service: LedgerAccountEntryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LedgerAccountEntryService],
    }).compile();

    service = module.get<LedgerAccountEntryService>(LedgerAccountEntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
