import { Test, TestingModule } from '@nestjs/testing';
import { LedgerEntryController } from './ledger-entry.controller';
import { LedgerEntryService } from './ledger-entry.service';

describe('LedgerEntryController', () => {
  let controller: LedgerEntryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LedgerEntryController],
      providers: [LedgerEntryService],
    }).compile();

    controller = module.get<LedgerEntryController>(LedgerEntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
