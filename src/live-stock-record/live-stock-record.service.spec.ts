import { Test, TestingModule } from '@nestjs/testing';
import { LiveStockRecordService } from './live-stock-record.service';

describe('LiveStockRecordService', () => {
  let service: LiveStockRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveStockRecordService],
    }).compile();

    service = module.get<LiveStockRecordService>(LiveStockRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
