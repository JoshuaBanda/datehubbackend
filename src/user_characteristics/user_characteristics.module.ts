import { Module } from '@nestjs/common';
import { UserCharacteristicsService } from './user_characteristics.service';
import { UserCharacteristicsController } from './user_characteristics.controller';

@Module({
  controllers: [UserCharacteristicsController],
  providers: [UserCharacteristicsService],
})
export class UserCharacteristicsModule {}
