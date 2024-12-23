import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionLikesService } from './confession-likes.service';

describe('ConfessionLikesService', () => {
  let service: ConfessionLikesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfessionLikesService],
    }).compile();

    service = module.get<ConfessionLikesService>(ConfessionLikesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
