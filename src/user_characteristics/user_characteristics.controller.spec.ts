import { Test, TestingModule } from '@nestjs/testing';
import { UserCharacteristicsController } from './user_characteristics.controller';
import { UserCharacteristicsService } from './user_characteristics.service';

describe('UserCharacteristicsController', () => {
  let controller: UserCharacteristicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCharacteristicsController],
      providers: [UserCharacteristicsService],
    }).compile();

    controller = module.get<UserCharacteristicsController>(UserCharacteristicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
