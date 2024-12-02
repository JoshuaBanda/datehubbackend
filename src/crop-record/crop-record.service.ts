// crop_record.service.ts
import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import { crop_record, selectCropRecord, insertCropRecord } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';

@Injectable()
export class CropRecordService {

  // Get all crop records
  async getAllCropRecords(): Promise<selectCropRecord[]> {
    try {
      const cropRecords = await db.select().from(crop_record).execute();
      return cropRecords;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve crop records');
    }
  }

  // Get crop record by ID
  async getCropRecordById(cropRecordId: number): Promise<selectCropRecord | null> {
    try {
      const [cropRecordData] = await db
        .select()
        .from(crop_record)
        .where(eq(crop_record.crop_record_id, cropRecordId))
        .execute();
      return cropRecordData || null;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve crop record by ID');
    }
  }

  // Create a new crop record
  async createCropRecord(createCropRecordDto: insertCropRecord): Promise<selectCropRecord> {
    try {
      const result = await db
        .insert(crop_record)
        .values(createCropRecordDto)
        .returning();
      return result[0]; // Return the inserted crop record
    } catch (error) {
      throw new InternalServerErrorException('Failed to create crop record');
    }
  }

  // Update crop record by ID
  async updateCropRecord(cropRecordId: number, updateCropRecordDto: Partial<insertCropRecord>): Promise<selectCropRecord | null> {
    try {
      const result = await db
        .update(crop_record)
        .set(updateCropRecordDto)
        .where(eq(crop_record.crop_record_id, cropRecordId))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update crop record');
    }
  }

  // Delete crop record by ID
  async deleteCropRecord(cropRecordId: number): Promise<void> {
    try {
      const result = await db
        .delete(crop_record)
        .where(eq(crop_record.crop_record_id, cropRecordId))
        .execute();
      if (result.count === 0) {
        throw new BadRequestException('Crop record not found');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete crop record');
    }
  }
}
