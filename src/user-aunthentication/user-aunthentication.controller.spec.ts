import { Test, TestingModule } from '@nestjs/testing';
import { UserAunthenticationController } from './user-aunthentication.controller';
import { UserAunthenticationService } from './user-aunthentication.service';

describe('UserAunthenticationController', () => {
  let controller: UserAunthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAunthenticationController],
      providers: [UserAunthenticationService],
    }).compile();

    controller = module.get<UserAunthenticationController>(UserAunthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
