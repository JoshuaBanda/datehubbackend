import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { insert_preferences, preferences, select_preferences } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PreferencesService {
  // Create a preference
  async createPreference(data: insert_preferences): Promise<select_preferences> {
    try {
      const [newPreference] = await db
        .insert(preferences)
        .values(data)
        .returning();

      return newPreference;
    } catch (error) {
      console.error('Error creating preference:', error);
      throw new InternalServerErrorException('Failed to create preference');
    }
  }

  // Get preference by user_id
  async getPreference(userId: number): Promise<select_preferences | null> {
    try {
      const [preference] = await db
        .select()
        .from(preferences)
        .where(eq(preferences.user_id, userId))
        .execute();

      return preference || null;
    } catch (error) {
      console.error('Error retrieving preference:', error);
      throw new InternalServerErrorException('Failed to retrieve preference');
    }
  }

  // Update preference by user_id
  async updatePreference(
    userId: number,
    updatedData: Partial<insert_preferences>
  ): Promise<select_preferences | null> {
    try {
      const result = await db
        .update(preferences)
        .set(updatedData)
        .where(eq(preferences.user_id, userId))
        .returning();

      if (result.length === 0) {
        throw new NotFoundException(`Preference for user ID ${userId} not found`);
      }

      return result[0];
    } catch (error) {
      console.error('Error updating preference:', error);
      throw new InternalServerErrorException('Failed to update preference');
    }
  }

  // Delete preference by user_id
  async deletePreference(userId: number): Promise<void> {
    try {
      const result = await db
        .delete(preferences)
        .where(eq(preferences.user_id, userId))
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`Preference for user ID ${userId} not found`);
      }
    } catch (error) {
      console.error('Error deleting preference:', error);
      throw new InternalServerErrorException('Failed to delete preference');
    }
  }
}
