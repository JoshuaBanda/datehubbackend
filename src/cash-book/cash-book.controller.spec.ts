import { Test, TestingModule } from '@nestjs/testing';
import { CashBookController } from './cash-book.controller';
import { CashBookService } from './cash-book.service';

describe('CashBookController', () => {
  let controller: CashBookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashBookController],
      providers: [CashBookService],
    }).compile();

    controller = module.get<CashBookController>(CashBookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
