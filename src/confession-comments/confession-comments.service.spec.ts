import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionCommentsService } from './confession-comments.service';

describe('ConfessionCommentsService', () => {
  let service: ConfessionCommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfessionCommentsService],
    }).compile();

    service = module.get<ConfessionCommentsService>(ConfessionCommentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
