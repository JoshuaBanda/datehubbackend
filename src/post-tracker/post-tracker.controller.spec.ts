import { Test, TestingModule } from '@nestjs/testing';
import { PostTrackerController } from './post-tracker.controller';
import { PostTrackerService } from './post-tracker.service';

describe('PostTrackerController', () => {
  let controller: PostTrackerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostTrackerController],
      providers: [PostTrackerService],
    }).compile();

    controller = module.get<PostTrackerController>(PostTrackerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
