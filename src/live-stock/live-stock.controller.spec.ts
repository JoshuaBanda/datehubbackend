import { Test, TestingModule } from '@nestjs/testing';
import { LiveStockController } from './live-stock.controller';
import { LiveStockService } from './live-stock.service';

describe('LiveStockController', () => {
  let controller: LiveStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveStockController],
      providers: [LiveStockService],
    }).compile();

    controller = module.get<LiveStockController>(LiveStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
