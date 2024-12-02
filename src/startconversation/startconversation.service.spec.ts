import { Test, TestingModule } from '@nestjs/testing';
import { StartconversationService } from './startconversation.service';

describe('StartconversationService', () => {
  let service: StartconversationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StartconversationService],
    }).compile();

    service = module.get<StartconversationService>(StartconversationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
