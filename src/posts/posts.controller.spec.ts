import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';

describe('PostsController', () => {
  let controller: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [PostService],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
