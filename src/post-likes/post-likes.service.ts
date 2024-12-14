import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { likes, selectLikes } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class LikesService {
  // Add a like to a post
  async addLike(postId: number, userId: number): Promise<any> {
    try {
      // Insert the like record into the database
      const [newLike] = await db
        .insert(likes)
        .values({
          post_id: postId,
          user_id: userId,
        })
        .returning(); // This will return the inserted like

      return newLike;
    } catch (error) {
      throw new InternalServerErrorException('Failed to add like');
    }
  }

  // Get all likes for a post
  async getLikesForPost(postId: number): Promise<selectLikes[] | null> {
    try {
      const likesForPost = await db
        .select()
        .from(likes)
        .where(eq(likes.post_id, postId)) // Filter likes by post_id
        .execute();

      return likesForPost.length > 0 ? likesForPost : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch likes for the post');
    }
  }

  // Delete a like for a post (by post_id and user_id)
  async deleteLike(postId: number, userId: number): Promise<void> {
    try {
      const result = await db
        .delete(likes) // Specify the 'likes' table
        .where(eq(likes.post_id, postId)) // Add condition for post_id
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`Like not found for post ${postId} by user ${userId}`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete like');
    }
  }
}
