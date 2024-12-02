import { Test, TestingModule } from '@nestjs/testing';
import { LiveStockService } from './live-stock.service';

describe('LiveStockService', () => {
  let service: LiveStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveStockService],
    }).compile();

    service = module.get<LiveStockService>(LiveStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
