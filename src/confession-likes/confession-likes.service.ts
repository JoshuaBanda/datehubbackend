import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { confession_likes, likes, selectConfessionLikes, selectLikes } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ConfessionLikesService {  // Renamed service to ConfessionLikesService
  // Add a like to a confession
  async addLike(confessionId: number, userId: number): Promise<any> {  // Renamed parameter to confessionId
    try {
      // Insert the like record into the database
      const [newLike] = await db
        .insert(confession_likes)
        .values({
          confession_id : confessionId,  // Renamed to confessionId
          user_id: userId,
        })
        .returning(); // This will return the inserted like

      return newLike;
    } catch (error) {
      throw new InternalServerErrorException('Failed to add like');
    }
  }

  // Get all likes for a confession
  async getLikesForConfession(confessionId: number): Promise<selectConfessionLikes[] | null> {  // Renamed to getLikesForConfession
    try {
      const likesForConfession = await db
        .select()
        .from(confession_likes)
        .where(eq(confession_likes.confession_id, confessionId)) // Filter likes by confessionId
        .execute();

      return likesForConfession.length > 0 ? likesForConfession : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch likes for the confession');
    }
  }

  // Delete a like for a confession (by confession_id and user_id)
  async deleteLike(confessionId: number, userId: number): Promise<void> {  // Renamed to confessionId
    try {
      const result = await db
        .delete(likes) // Specify the 'likes' table
        .where(eq(confession_likes.confession_id, confessionId)) // Add condition for confessionId
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`Like not found for confession ${confessionId} by user ${userId}`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete like');
    }
  }
}
