import { Test, TestingModule } from '@nestjs/testing';
import { UserCharacteristicsService } from './user_characteristics.service';

describe('UserCharacteristicsService', () => {
  let service: UserCharacteristicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserCharacteristicsService],
    }).compile();

    service = module.get<UserCharacteristicsService>(UserCharacteristicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
