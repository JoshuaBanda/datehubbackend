import { Test, TestingModule } from '@nestjs/testing';
import { InboxparticipantsService } from './inboxparticipants.service';

describe('InboxparticipantsService', () => {
  let service: InboxparticipantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InboxparticipantsService],
    }).compile();

    service = module.get<InboxparticipantsService>(InboxparticipantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
