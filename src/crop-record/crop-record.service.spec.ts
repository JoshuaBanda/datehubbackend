import { Test, TestingModule } from '@nestjs/testing';
import { CropRecordService } from './crop-record.service';

describe('CropRecordService', () => {
  let service: CropRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CropRecordService],
    }).compile();

    service = module.get<CropRecordService>(CropRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
