import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { insert_preferences, select_preferences } from 'src/db/schema';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  // Create preference
  @Post()
  async create(@Body() data: insert_preferences): Promise<select_preferences> {
    return this.preferencesService.createPreference(data);
  }

  // Get preference by user_id
  @Get(':userId')
  async get(@Param('userId') userId: number): Promise<select_preferences | null> {
    return this.preferencesService.getPreference(userId);
  }

  // Update preference by user_id
  @Put(':userId')
  async update(
    @Param('userId') userId: number,
    @Body() updatedData: Partial<insert_preferences>
  ): Promise<select_preferences | null> {
    return this.preferencesService.updatePreference(userId, updatedData);
  }

  // Delete preference by user_id
  @Delete(':userId')
  async delete(@Param('userId') userId: number): Promise<void> {
    return this.preferencesService.deletePreference(userId);
  }
}
