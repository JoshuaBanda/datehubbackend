import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { selectBusiness, business, usersTable, insertBusiness, selectUsers } from 'src/db/schema';
import { eq, gt, inArray, not, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { BusinessTracker } from './business-tracker';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BusinessService {
  private businessTracker: BusinessTracker;
  // User-specific cache for businesses
  private userCaches: Map<number, (selectBusiness & { username: string; lastname: string; profilepicture: string })[]> =
    new Map();

  constructor(
    private eventEmitter: EventEmitter2) {
    v2.config({
      cloud_name: 'dfahzd3ky',
      api_key: '377379954858251',
      api_secret: 'Cxu4QkxXCmd400-VWttlRZ_w9p8',
    });
    this.businessTracker = new BusinessTracker();
  }

  async getBusinesses(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<(selectBusiness & { username: string; lastname: string; profilepicture: string })[] | null> {
    try {
      const offset = (page - 1) * limit;
  
      // Retrieve cached businesses for the user
      const cachedBusinesses = this.userCaches.get(userId) || [];
      
      // Filter out businesses that have already been sent
      const unsentCachedBusinesses = cachedBusinesses.filter(
        (business) => !this.businessTracker.getSentBusinessIds(userId).includes(business.business_id)
      );
  
      // If unsent businesses are available in the cache, return them
      if (unsentCachedBusinesses.length > 0) {
        //console.log(`Returning ${unsentCachedBusinesses.length} cached businesses for user ${userId}`);
        const paginatedBusinesses = unsentCachedBusinesses.slice(offset, offset + limit);
        this.businessTracker.markBusinessesAsSent(userId, paginatedBusinesses); // Mark businesses as sent
        return paginatedBusinesses;
      }
  
      // If no unsent businesses are found, fetch new businesses from the database
      //console.log(`No unsent cached businesses for user ${userId}`);
      
      const results = await db
        .select()
        .from(business)
        .where(not(inArray(business.business_id, this.businessTracker.getSentBusinessIds(userId)))) // Filter out already sent businesses
        .limit(limit)
        .offset(offset)
        .execute();
  
      if (results.length === 0) {
        //console.log(`No new businesses available for user ${userId}. Clearing tracker.`);
        this.businessTracker.clearSentBusinesses(userId); // Clear the tracker if no new businesses are found
        return null; // Return null when no new businesses are available
      }
  
      // Append new businesses to the cache and mark them as sent
      const businessesWithUserDetails = await this.fetchBusinessesWithUserDetails(results);
      //console.log(`Updating cache and tracker for user ${userId}`);
      
      // Append the new businesses to the existing cache (avoiding overwriting)
      const updatedCache = [...cachedBusinesses, ...businessesWithUserDetails];
      this.userCaches.set(userId, updatedCache);
      this.businessTracker.markBusinessesAsSent(userId, results);
  
      return businessesWithUserDetails;
    } catch (error) {
      console.error(`Error fetching businesses for user ${userId}:`, error);
      throw new InternalServerErrorException('Failed to retrieve businesses');
    }
  }
  
  private async fetchBusinessesWithUserDetails(
    businesses: selectBusiness[]
  ): Promise<(selectBusiness & { username: string; lastname: string; profilepicture: string })[]> {
    return await Promise.all(
      businesses.map(async (business) => {
        const [user] = await db
          .select({
            firstname: usersTable.firstname,
            lastname: usersTable.lastname,
            profilepicture: usersTable.profilepicture,
          })
          .from(usersTable)
          .where(eq(usersTable.userid, business.user_id))
          .execute();

        return {
          ...business,
          username: user ? user.firstname : 'anonymous',
          lastname: user ? user.lastname : '',
          profilepicture: user ? user.profilepicture : '',
        };
      })
    );
  }

  // Method to update the cache for all users
  async updateCache(): Promise<void> {
    //console.log('Updating business caches for all users...');

    try {
      const allBusinesses = await db.select().from(business).execute();
      const businessesWithUserDetails = await this.fetchBusinessesWithUserDetails(allBusinesses);

      // Update cache for each user individually
      this.userCaches.forEach((_, userId) => {
        this.userCaches.set(
          userId,
          businessesWithUserDetails.filter(
            (business) => !this.businessTracker.getSentBusinessIds(userId).includes(business.business_id)
          )
        );
      });

      //console.log('Business caches updated successfully');
    } catch (error) {
      console.error('Failed to update business caches:', error);
    }
  }

  // Schedule the cache update to run every minute
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledCacheUpdate(): Promise<void> {
    await this.updateCache();
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

  // the previous implements

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
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          //console.log('Cloudinary upload result:', result); // Log the result
          resolve(result);
        }
      );
  
      uploadStream.end(fileBuffer); // End the stream with the buffer
    });
  }
  
  // Create a new business
  async createBusiness(data: insertBusiness): Promise<selectBusiness | null> {
    try {
      const [newBusiness] = await db
        .insert(business)
        .values(data)
        .returning(); // Returning the newly inserted business
  
      return newBusiness; // Return the inserted business data
    } catch (error) {
      throw new InternalServerErrorException('Failed to create business', error);
    }
  }

  // Get a business by its ID
  async getBusinessById(businessId: selectBusiness['business_id']): Promise<selectBusiness | null> {
    try {
      const [businessData] = await db
        .select()
        .from(business)
        .where(eq(business.business_id, businessId))
        .execute();
  
      if (!businessData) {
        throw new NotFoundException(`Business with ID ${businessId} not found`);
      }
  
      return businessData;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve business');
    }
  }

  // Get all businesses by a user ID
  async getBusinessesByUser(userId: selectUsers['userid']): Promise<(selectBusiness & { username: string, lastname: string, profilepicture: string })[] | null> {
    try {
      const results = await db
        .select()
        .from(business)
        .where(eq(business.user_id, userId))
        .execute();
  
      // If no businesses are found, return null
      if (results.length === 0) {
        return null;
      }
  
      const userIdFromBusiness = results[0].user_id; // Access user_id from the first business
  
      // Fetching the username (firstname, lastname) and profile picture for that user
      const [user] = await db
        .select({
          firstname: usersTable.firstname,
          lastname: usersTable.lastname,
          profilepicture: usersTable.profilepicture,
        })
        .from(usersTable)
        .where(eq(usersTable.userid, userIdFromBusiness))
        .execute();
  
      // Map businesses and ensure that every business has a username and other fields
      const businessesWithUserDetails = results.map(business => ({
        ...business, // Spread the existing business fields
        username: user ? user.firstname : 'anonymous', // Query for username (firstname)
        lastname: user ? user.lastname : '', // Query for lastname
        profilepicture: user ? user.profilepicture : '', // Query for profilepicture
      }));
  
      return businessesWithUserDetails; // Return businesses with username, lastname, and profile picture
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve businesses');
    }
  }

  // Get businesses created after the given timestamp
  async getBusinessAfter(lastTimestamp: Date): Promise<selectBusiness[]> {
    try {
      console.log('Fetching businesses after timestamp:', lastTimestamp); // Log the input timestamp
  
      // Query the database for businesses that have a 'createdAt' timestamp greater than the lastTimestamp
      const result = await db
        .select()
        .from(business)
        .where(gt(business.created_at, lastTimestamp))  // Exclude businesses equal to lastTimestamp
        .orderBy(business.created_at) // Ensure businesses are ordered by timestamp in ascending order
        .execute();
  
      if (result.length === 0) {
        console.log('No businesses found after timestamp:', lastTimestamp); // Log when no data is found
      }
  
      // Log the query result before returning
      console.log('Fetched businesses:', result); // Log the result from the database query
  
      return result;  // Return the result
    } catch (error) {
      console.error('Error fetching business after timestamp:', error); // Log any error that occurs during the query
      throw new Error('Failed to fetch business after the specified timestamp');
    }
  }
  


  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
        v2.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error); // Log detailed error
                return reject(error);
            }
            //console.log('Cloudinary delete result:', result);
            resolve(result);
        });
    });
  }

  async deleteBusiness(businessId: selectBusiness['business_id']): Promise<void> {
      try {
        const result = await db
          .delete(business)
          .where(eq(business.business_id, businessId));
  
        if (result.count === 0) {
          throw new NotFoundException(`Business with ID ${businessId} not found`);
        }
    
        return;
      } catch (error) {
        throw new InternalServerErrorException('Failed to delete business');
      }
    }
  
  async updateBusinessDescription(businessId: selectBusiness['business_id'], newDescription: string): Promise<void> {
    try {
      console.log(businessId,newDescription);
      const result = await db
        .update(business)
        .set({ description: newDescription })
        .where(eq(business.business_id, businessId));
  
      if (result.count === 0) {
        throw new NotFoundException(`business with ID ${businessId} not found`);
      }
      console.log('hey');
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update business description');
    }
  }


}
