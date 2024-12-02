import { Test, TestingModule } from '@nestjs/testing';
import { UserAunthenticationService } from './user-aunthentication.service';

describe('UserAunthenticationService', () => {
  let service: UserAunthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAunthenticationService],
    }).compile();

    service = module.get<UserAunthenticationService>(UserAunthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
