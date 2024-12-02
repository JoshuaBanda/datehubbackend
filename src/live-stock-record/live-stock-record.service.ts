// livestock_record.service.ts
import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import { livestock_record, selectLivestockRecord, insertLivestockRecord } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';

@Injectable()
export class LivestockRecordService {

  // Get all livestock records
  async getAllLivestockRecords(): Promise<selectLivestockRecord[]> {
    try {
      const livestockRecords = await db.select().from(livestock_record).execute();
      return livestockRecords;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve livestock records');
    }
  }

  // Get livestock record by ID
  async getLivestockRecordById(livestockRecordId: number): Promise<selectLivestockRecord | null> {
    try {
      const [livestockRecordData] = await db
        .select()
        .from(livestock_record)
        .where(eq(livestock_record.livestock_record_id, livestockRecordId))
        .execute();
      return livestockRecordData || null;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve livestock record by ID');
    }
  }

  // Create a new livestock record
  async createLivestockRecord(createLivestockRecordDto: insertLivestockRecord): Promise<selectLivestockRecord> {
    try {
      const result = await db
        .insert(livestock_record)
        .values(createLivestockRecordDto)
        .returning();
      return result[0]; // Return the inserted livestock record
    } catch (error) {
      throw new InternalServerErrorException('Failed to create livestock record');
    }
  }

  // Update livestock record by ID
  async updateLivestockRecord(livestockRecordId: number, updateLivestockRecordDto: Partial<insertLivestockRecord>): Promise<selectLivestockRecord | null> {
    try {
      const result = await db
        .update(livestock_record)
        .set(updateLivestockRecordDto)
        .where(eq(livestock_record.livestock_record_id, livestockRecordId))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update livestock record');
    }
  }

  // Delete livestock record by ID
  async deleteLivestockRecord(livestockRecordId: number): Promise<void> {
    try {
      const result = await db
        .delete(livestock_record)
        .where(eq(livestock_record.livestock_record_id, livestockRecordId))
        .execute();
      if (result.count === 0) {
        throw new BadRequestException('Livestock record not found');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete livestock record');
    }
  }
}
