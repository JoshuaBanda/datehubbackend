import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { confession, usersTable, insertConfession, selectUsers, selectConfession } from 'src/db/schema';
import { eq, inArray, not, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { ConfessionTracker } from './confession-tracker';

@Injectable()
export class ConfessionService { // Rename class to ConfessionService
  private confessionTracker: ConfessionTracker;
  private userCaches: Map<number, (selectConfession & { username: string; lastname: string; profilepicture: string })[]> =
    new Map();

  constructor() {
    v2.config({
      cloud_name: 'dfahzd3ky',
      api_key: '377379954858251',
      api_secret: 'Cxu4QkxXCmd400-VWttlRZ_w9p8',
    });
    this.confessionTracker = new ConfessionTracker();
  }

  async getConfessions(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<(selectConfession & { username: string; lastname: string; profilepicture: string })[] | null> { //  to getConfessions
    try {
      const offset = (page - 1) * limit;
  
      // Retrieve cached confessions for the user
      const cachedConfessions = this.userCaches.get(userId) || [];
      
      // Filter out confessions that have already been sent
      const unsentCachedConfessions = cachedConfessions.filter(
        (confession) => !this.confessionTracker.getSentConfessionIds(userId).includes(confession.confession_id)
      );
  
      // If unsent confessions are available in the cache, return them
      if (unsentCachedConfessions.length > 0) {
        //console.log(`Returning ${unsentCachedConfessions.length} cached confessions for user ${userId}`);
        const paginatedConfessions = unsentCachedConfessions.slice(offset, offset + limit);
        this.confessionTracker.markConfessionsAsSent(userId, paginatedConfessions); // Mark confessions as sent
        return paginatedConfessions;
      }
  
      // If no unsent confessions are found, fetch new confessions from the database
      //console.log(`No unsent cached confessions for user ${userId}`);
      
      const results = await db
        .select()
        .from(confession) // Change to "confession"
        .where(not(inArray(confession.confession_id, this.confessionTracker.getSentConfessionIds(userId)))) // Adjust to filter confessions
        .limit(limit)
        .offset(offset)
        .execute();
  
      if (results.length === 0) {
        //console.log(`No new confessions available for user ${userId}. Clearing tracker.`);
        this.confessionTracker.clearSentConfessions(userId); // Clear the tracker if no new confessions are found
        return null; // Return null when no new confessions are available
      }
  
      // Append new confessions to the cache and mark them as sent
      const confessionsWithUserDetails = await this.fetchConfessionsWithUserDetails(results);
      //console.log(`Updating cache and tracker for user ${userId}`);
      
      // Append the new confessions to the existing cache
      const updatedCache = [...cachedConfessions, ...confessionsWithUserDetails];
      this.userCaches.set(userId, updatedCache);
      this.confessionTracker.markConfessionsAsSent(userId, results);
  
      return confessionsWithUserDetails;
    } catch (error) {
      //console.error(`Error fetching confessions for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve confessions');
    }
  }

  private async fetchConfessionsWithUserDetails(
    confessions: selectConfession[] // Update method name to handle confessions
  ): Promise<(selectConfession & { username: string; lastname: string; profilepicture: string })[]> {
    return await Promise.all(
      confessions.map(async (confession) => {
        const [user] = await db
          .select({
            firstname: usersTable.firstname,
            lastname: usersTable.lastname,
            profilepicture: usersTable.profilepicture,
          })
          .from(usersTable)
          .where(eq(usersTable.userid, confession.user_id))
          .execute();

        return {
          ...confession,
          username: user ? user.firstname : 'anonymous',
          lastname: user ? user.lastname : '',
          profilepicture: user ? user.profilepicture : '',
        };
      })
    );
  }

  // Create a new confession
  async createConfession(data: insertConfession): Promise<selectConfession | null> { // Rename method to createConfession
    try {
      const [newConfession] = await db
        .insert(confession) 
        .values(data)
        .returning();
  
      return newConfession;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create confession', error);
    }
  }

  // Get a confession by its ID
  async getConfessionById(confessionId: selectConfession['confession_id']): Promise<selectConfession | null> {
    try {
      const [confessionData] = await db
        .select()
        .from(confession) 
        .where(eq(confession.confession_id, confessionId))
        .execute();
  
      if (!confessionData) {
        throw new NotFoundException(`Confession with ID ${confessionId} not found`);
      }
  
      return confessionData;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve confession');
    }
  }

  // Update a confession's description
  async updateConfessionDescription(confessionId: selectConfession['confession_id'], newDescription: string): Promise<void> { // Rename method
    try {
      const result = await db
        .update(confession) 
        .set({ description: newDescription })
        .where(eq(confession.confession_id, confessionId));
  
      if (result.count === 0) {
        throw new NotFoundException(`Confession with ID ${confessionId} not found`);
      }
  
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update confession description');
    }
  }

  // Delete a confession by ID
  async deleteConfession(confessionId: selectConfession['confession_id']): Promise<void> { // Rename method
    try {
      const result = await db
        .delete(confession) 
        .where(eq(confession.confession_id, confessionId));

      if (result.count === 0) {
        throw new NotFoundException(`Confession with ID ${confessionId} not found`);
      }
  
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete confession');
    }
  }

  // Clear the cache for a specific user
  clearUserCache(userId: number): void {
    //console.log(`Clearing cache for user ${userId}`);
    this.userCaches.delete(userId);
  }

  // Clear the caches for all users
  clearAllCaches(): void {
    //console.log('Clearing caches for all users');
    this.userCaches.clear();
  }

  // Method to update the cache for all users
  async updateCache(): Promise<void> {
    //console.log('Updating confession caches for all users...');

    try {
      const allConfessions = await db.select().from(confession).execute();
      const confessionsWithUserDetails = await this.fetchConfessionsWithUserDetails(allConfessions);

      // Update cache for each user individually
      this.userCaches.forEach((_, userId) => {
        this.userCaches.set(
          userId,
          confessionsWithUserDetails.filter(
            (confession) => !this.confessionTracker.getSentConfessionIds(userId).includes(confession.confession_id)
          )
        );
      });

      //console.log('Confession caches updated successfully');
    } catch (error) {
      //console.error('Failed to update confession caches:', error);
    }
  }

  // Schedule the cache update to run every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledCacheUpdate(): Promise<void> {
    await this.updateCache();
  }

  // The other methods for handling image uploads, etc., can be retained as-is
  async uploadImage(fileBuffer: Buffer, fileName: string, quality: number): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          resource_type: 'auto',  // Automatically detect file type
          public_id: fileName,    // Use fileName as public_id
          folder: 'farmsmart',    // Optionally specify a folder
          transformation: [
            { width: 800, height: 600, crop: 'limit' },  // Resize to fit within 800x600
            { quality: quality },  // Specify custom quality (e.g., 80)
          ],
        },
        (error, result) => {
          if (error) {
            //console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          //console.log('Cloudinary upload result:', result); // Log the result
          resolve(result);
        }
      );
  
      uploadStream.end(fileBuffer); // End the stream with the buffer
    });
  }

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
        v2.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
            if (error) {
               // console.error('Cloudinary delete error:', error); // Log detailed error
                return reject(error);
            }
            //console.log('Cloudinary delete result:', result);
            resolve(result);
        });
    });
  }

  // Update profile picture
  async updateProfilePicture(email: string, profilepicture: string) {
    try {
      if (!email || !profilepicture) {
        throw new Error('Invalid input data');
      }
      //console.log('chec', email, profilepicture);

      // Perform the update operation
      const result = await db
        .update(usersTable)
        .set({ profilepicture: profilepicture })
        .where(eq(usersTable.email, email));

      if (result.count === 0) {
        throw new Error(`No user found with the email: ${email}`);
      }

      return { message: 'Updated successfully', updatedRows: result.count };
    } catch (error) {
      //console.error('Error updating :', error);
      throw new Error('Failed to update. Please try again later.');
    }
  }
}
