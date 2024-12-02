import { Test, TestingModule } from '@nestjs/testing';
import { InboxparticipantsController } from './inboxparticipants.controller';
import { InboxparticipantsService } from './inboxparticipants.service';

describe('InboxparticipantsController', () => {
  let controller: InboxparticipantsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InboxparticipantsController],
      providers: [InboxparticipantsService],
    }).compile();

    controller = module.get<InboxparticipantsController>(InboxparticipantsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
