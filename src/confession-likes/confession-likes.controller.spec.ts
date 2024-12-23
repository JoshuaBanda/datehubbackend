import { Test, TestingModule } from '@nestjs/testing';
import { ConfessionLikesController } from './confession-likes.controller';
import { ConfessionLikesService } from './confession-likes.service';

describe('ConfessionLikesController', () => {
  let controller: ConfessionLikesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfessionLikesController],
      providers: [ConfessionLikesService],
    }).compile();

    controller = module.get<ConfessionLikesController>(ConfessionLikesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
