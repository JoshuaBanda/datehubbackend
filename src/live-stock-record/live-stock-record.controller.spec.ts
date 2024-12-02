import { Test, TestingModule } from '@nestjs/testing';
import { LiveStockRecordController } from './live-stock-record.controller';
import { LiveStockRecordService } from './live-stock-record.service';

describe('LiveStockRecordController', () => {
  let controller: LiveStockRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveStockRecordController],
      providers: [LiveStockRecordService],
    }).compile();

    controller = module.get<LiveStockRecordController>(LiveStockRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
