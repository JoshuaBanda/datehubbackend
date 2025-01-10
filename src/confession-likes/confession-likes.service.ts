import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { confession_likes, likes, selectConfessionLikes, selectLikes } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class ConfessionLikesService {  // Renamed service to ConfessionLikesService
  // Add a like to a confession
async addLike(confessionId: number, userId: number): Promise<any> { try {
    // Perform the select query to check if a like exists for the give confessionId and userId
    const [existingLike] = await db
      .select()
      .from(confession_likes)
      .where(
        sql`${confession_likes.confession_id} = ${confessionId} AND ${confession_likes.user_id} = ${userId}`
      )
      .execute();

    if (existingLike) {
      //console.log("Like exists for this confession and user");
      return true; // User has already liked this confession
    } else {
      //console.log("No like exists for this confession and user");
      
      //console.log("liked confession");
      const [newLike] = await db
        .insert(confession_likes)
        .values({
          confession_id: confessionId,
          user_id: userId,
        })
        .returning(); // This will return the inserted like

      return newLike;
    }
  } catch (error) {
    console.error("Error checking like for the confession:", error);
    throw new InternalServerErrorException("Failed to check like for the confession");
  }
  }

  // Get all likes for a confession
  async getLikesForConfession(confessionId: number): Promise<selectConfessionLikes[] | null> {
    try {
      const likesForConfession = await db
        .select()
        .from(confession_likes)
        .where(eq(confession_likes.confession_id, confessionId)) // Filter likes by confession_id
        .execute();
      return likesForConfession.length > 0 ? likesForConfession : null;
    } catch (error) {

      throw new InternalServerErrorException('Failed to fetch likes for the confession');
    }
  }

  // Delete a like for a confession (by confession_id and user_id)
  async deleteLike(confessionId: number, userId: number): Promise<void> {
    try {
      const result = await db
        .delete(confession_likes) // Specify the 'likes' table
        .where(eq(confession_likes.confession_id, confessionId) && eq(confession_likes.user_id, userId)) // Combine the conditions using `&&`
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`Like not found for confession ${confessionId} by user ${userId}`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete like');
    }
  }

  // Check if a user has liked a confession
  async hasUserLikedConfession(confessionId: number, userId: number): Promise<boolean> {
    try {
      // Check if the like exists for the given confession_id and user_id
      const result = await db
        .select()
        .from(confession_likes)
        .where(eq(confession_likes.confession_id, confessionId) && eq(likes.user_id, userId))
        .execute();

      // If result.length > 0, it means the user has liked the confession
      return result.length > 0;
    } catch (error) {
      throw new InternalServerErrorException('Failed to check like status');
    }
  }
}
