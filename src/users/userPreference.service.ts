import { InternalServerErrorException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { db } from "src/db";
import { preferences, usersTable } from "src/db/schema";

class UserPreferenceService {
    private userPreferencesCache = new Map<number, any>(); // Cache for user preferences
  
    // Fetch preferences for a user
    async getPreference(userId: number): Promise<any | null> {
      try {
        const cachedPreference = this.userPreferencesCache.get(userId);
        if (cachedPreference) {
          console.log(`Returning cached preference for user ${userId}`);
          return cachedPreference;
        }
  
        // If not in cache, fetch from the database
        const preference = await db
                  .select()
                  .from(preferences)
                  .where(eq(preferences.user_id, userId))
                  .execute();
  
        if (preference.length > 0) {
          const userPref = preference[0];
          // Store in the cache
          this.userPreferencesCache.set(userId, userPref);
          console.log(`Caching preference for user ${userId}`);
          return userPref;
        }
  
        console.log(`No preference found for user ${userId}`);
        return null; // Return null if no preferences are found
      } catch (error) {
        console.error(`Error fetching preference for user ${userId}:`, error);
        throw new InternalServerErrorException('Failed to fetch user preference', error.message);
      }
    }
  
    // Fetch all users from the database (or cache them if needed)
    async getUsers(): Promise<any[]> {
      try {
        const users = await db
          .select()
          .from(usersTable) // Assuming the users are in this table
          .execute();
        return users;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new InternalServerErrorException('Failed to fetch users');
      }
    }
  }
  