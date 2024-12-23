import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionCommentsController } from './confession-comments.controller';
import { ConfessionCommentsService } from './confession-comments.service';

describe('ConfessionCommentsController', () => {
  let controller: ConfessionCommentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfessionCommentsController],
      providers: [ConfessionCommentsService],
    }).compile();

    controller = module.get<ConfessionCommentsController>(ConfessionCommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
