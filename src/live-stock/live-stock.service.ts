// livestock.service.ts
import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import { livestock, selectLivestock, insertLivestock } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';

@Injectable()
export class LivestockService {

  // Get all livestock
  async getAllLivestock(): Promise<selectLivestock[]> {
    try {
      const livestockData = await db.select().from(livestock).execute();
      return livestockData;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve livestock');
    }
  }

  // Get livestock by ID
  async getLivestockById(livestockId: number): Promise<selectLivestock | null> {
    try {
      const [livestockData] = await db
        .select()
        .from(livestock)
        .where(eq(livestock.livestockid, livestockId))
        .execute();
      return livestockData || null;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve livestock by ID');
    }
  }

  // Create a new livestock
  async createLivestock(createLivestockDto: insertLivestock): Promise<selectLivestock> {
    try {
      const result = await db
        .insert(livestock)
        .values(createLivestockDto)
        .returning();
      return result[0]; // Return the inserted livestock
    } catch (error) {
      throw new InternalServerErrorException('Failed to create livestock');
    }
  }

  // Update livestock by ID
  async updateLivestock(livestockId: number, updateLivestockDto: Partial<insertLivestock>): Promise<selectLivestock | null> {
    try {
      const result = await db
        .update(livestock)
        .set(updateLivestockDto)
        .where(eq(livestock.livestockid, livestockId))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update livestock');
    }
  }

  // Delete livestock by ID
  async deleteLivestock(livestockId: number): Promise<void> {
    try {
      const result = await db
        .delete(livestock)
        .where(eq(livestock.livestockid, livestockId))
        .execute();
      if (result.count === 0) {
        throw new BadRequestException('Livestock not found');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete livestock');
    }
  }
}
