import { Test, TestingModule } from '@nestjs/testing';
import { StartconversationController } from './startconversation.controller';
import { StartconversationService } from './startconversation.service';

describe('StartconversationController', () => {
  let controller: StartconversationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StartconversationController],
      providers: [StartconversationService],
    }).compile();

    controller = module.get<StartconversationController>(StartconversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
