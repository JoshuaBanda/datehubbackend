import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { insert_user_characteristics, select_user_characteristics } from 'src/db/schema';
import { UserCharacteristicsService } from './user_characteristics.service';

@Controller('user-characteristics')
export class UserCharacteristicsController {
  constructor(private readonly userCharacteristicsService: UserCharacteristicsService) {}

  // Create user characteristics
  @Post('create')
  async create(@Body() data: insert_user_characteristics): Promise<select_user_characteristics> {
    return this.userCharacteristicsService.createUserCharacteristics(data);
  }

  // Get user characteristics by user_id
  @Get(':userId')
  async get(@Param('userId') userId: number): Promise<select_user_characteristics | null> {
    return this.userCharacteristicsService.getUserCharacteristics(userId);
  }

  // Update user characteristics by user_id
  @Put(':userId')
  async update(
    @Param('userId') userId: number,
    @Body() updatedData: Partial<insert_user_characteristics>
  ): Promise<select_user_characteristics | null> {
    return this.userCharacteristicsService.updateUserCharacteristics(userId, updatedData);
  }

  // Delete user characteristics by user_id
  @Delete(':userId')
  async delete(@Param('userId') userId: number): Promise<void> {
    return this.userCharacteristicsService.deleteUserCharacteristics(userId);
  }
}
