import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { user_characteristics, preferences, insert_user_characteristics, select_user_characteristics } from 'src/db/schema';
import { eq } from 'drizzle-orm';


@Injectable()
export class UserCharacteristicsService {
  // Create a user characteristic
  async createUserCharacteristics(data: insert_user_characteristics): Promise<select_user_characteristics> {
    try {
      // Ensure that the year_of_study is either a valid integer or null (not a string 'null')
      console.log(data);
      if (data.year_of_study == null || isNaN(data.year_of_study)) {
        data.year_of_study = 0;  // Set to null if the value is invalid or undefined
      }

  
      // Insert data into the database
      const [newUserCharacteristic] = await db
        .insert(user_characteristics)
        .values(data)
        .returning();
  
      return newUserCharacteristic;
    } catch (error) {
      console.error('Error creating user characteristic:', error);
      throw new InternalServerErrorException('Failed to create user characteristics');
    }
  }
  

  // Get user characteristics by user_id
  async getUserCharacteristics(userId: number): Promise<select_user_characteristics | null> {
    try {
      const [userCharacteristic] = await db
        .select()
        .from(user_characteristics)
        .where(eq(user_characteristics.user_id, userId))
        .execute();

      return userCharacteristic || null;
    } catch (error) {
      console.error('Error retrieving user characteristics:', error);
      throw new InternalServerErrorException('Failed to retrieve user characteristics');
    }
  }

  // Update user characteristics by user_id
  async updateUserCharacteristics(
    userId: number,
    updatedData: Partial<insert_user_characteristics>
  ): Promise<select_user_characteristics | null> {
    try {
      const result = await db
        .update(user_characteristics)
        .set(updatedData)
        .where(eq(user_characteristics.user_id, userId))
        .returning();

      if (result.length === 0) {
        throw new NotFoundException(`User characteristics for user ID ${userId} not found`);
      }

      return result[0];
    } catch (error) {
      console.error('Error updating user characteristics:', error);
      throw new InternalServerErrorException('Failed to update user characteristics');
    }
  }

  // Delete user characteristics by user_id
  async deleteUserCharacteristics(userId: number): Promise<void> {
    try {
      const result = await db
        .delete(user_characteristics)
        .where(eq(user_characteristics.user_id, userId))
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`User characteristics for user ID ${userId} not found`);
      }
    } catch (error) {
      console.error('Error deleting user characteristics:', error);
      throw new InternalServerErrorException('Failed to delete user characteristics');
    }
  }
}
