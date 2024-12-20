import { Test, TestingModule } from '@nestjs/testing';
import { PostTrackerService } from './post-tracker.service';

describe('PostTrackerService', () => {
  let service: PostTrackerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostTrackerService],
    }).compile();

    service = module.get<PostTrackerService>(PostTrackerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
