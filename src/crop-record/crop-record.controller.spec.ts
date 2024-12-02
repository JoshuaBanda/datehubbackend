import { Test, TestingModule } from '@nestjs/testing';
import { CropRecordController } from './crop-record.controller';
import { CropRecordService } from './crop-record.service';

describe('CropRecordController', () => {
  let controller: CropRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CropRecordController],
      providers: [CropRecordService],
    }).compile();

    controller = module.get<CropRecordController>(CropRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
