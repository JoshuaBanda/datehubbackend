import { Module } from '@nestjs/common';
import { UserAunthenticationService } from './user-aunthentication.service';
import { UserAunthenticationController } from './user-aunthentication.controller';

@Module({
  controllers: [UserAunthenticationController],
  providers: [UserAunthenticationService],
})
export class UserAunthenticationModule {}
