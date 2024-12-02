// crop.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { db } from 'src/db';
import { crop, selectCrop, insertCrop } from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Crop } from './entities/crop.entity';
import { CreateCropDto } from './dto/create-crop.dto';

@Injectable()
export class CropService {

  // Get all crops
  async getAllCrops(): Promise<selectCrop[]> {
    try {
      const crops = await db.select().from(crop).execute();
      return crops;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve crops');
    }
  }

  // Get crop by ID
  async getCropById(cropId: number): Promise<selectCrop | null> {
    try {
      const [cropData] = await db
        .select()
        .from(crop)
        .where(eq(crop.cropid, cropId))
        .execute();
      return cropData || null;
    } catch (error) {
      throw new InternalServerErrorException('Could not retrieve crop by ID');
    }
  }

  async createCrop(createCropDto: CreateCropDto): Promise<Crop> {
    try {
      const { name,quality,status } = createCropDto;
      console.log(name,quality,status);
      const result = await db.insert(crop).values( {
        name,
        quality,
        status
      } ).returning();

      if (!result) {
        throw new HttpException('Failed to create crop', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return result;
    } catch (error) {
      console.error('Error creating crop:', error);
      throw new HttpException('Failed to create crop', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Update crop by ID
  async updateCrop(cropId: number, updateCropDto: Partial<insertCrop>): Promise<selectCrop | null> {
    try {
      const result = await db
        .update(crop)
        .set(updateCropDto)
        .where(eq(crop.cropid, cropId))
        .returning();
      return result[0] || null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update crop');
    }
  }

  // Delete crop by ID
  async deleteCrop(cropId: number): Promise<void> {
    try {
      const result = await db
        .delete(crop)
        .where(eq(crop.cropid, cropId))
        .execute();
      if (result.count === 0) {
        throw new BadRequestException('Crop not found');
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete crop');
    }
  }
}