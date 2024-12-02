import { Test, TestingModule } from '@nestjs/testing';
import { CashBookService } from './cash-book.service';

describe('CashBookService', () => {
  let service: CashBookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CashBookService],
    }).compile();

    service = module.get<CashBookService>(CashBookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
