import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { insertPost, selectPost, post, usersTable, selectUsers } from 'src/db/schema';
import { db } from 'src/db';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PostService {

  // Create a new post
  async createPost(data: insertPost): Promise<selectPost | null> {
    try {
      // Insert the new post data into the database
      const [newPost] = await db
        .insert(post)
        .values(data)
        .returning(); // Returning the newly inserted post
  
      return newPost; // Return the inserted post data
    } catch (error) {
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  // Get a post by its ID
  async getPostById(postId: selectPost['post_id']): Promise<selectPost | null> {
    try {
      const [postData] = await db
        .select()
        .from(post)
        .where(eq(post.post_id, postId))
        .execute();
  
      if (!postData) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
  
      return postData;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve post');
    }
  }

  // Get all posts by a user ID
  async getPostsByUser(userId: selectUsers['userid']): Promise<selectPost[] | null> {
    try {
      const results = await db
        .select()
        .from(post)
        .where(eq(post.user_id, userId))
        .execute();
  
      return results.length > 0 ? results : null; // Return null if no posts found
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }

  // Update a post's description
  async updatePostDescription(postId: selectPost['post_id'], newDescription: string): Promise<void> {
    try {
      const result = await db
        .update(post)
        .set({ description: newDescription })
        .where(eq(post.post_id, postId));
        

      if (result.count === 0) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
  
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update post description');
    }
  }

  // Delete a post by ID
  async deletePost(postId: selectPost['post_id']): Promise<void> {
    try {
      const result = await db
        .delete(post)
        .where(eq(post.post_id, postId));

      if (result.count === 0) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }
  
      return;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  // Get posts liked by a user
  async getPostsLikedByUser(userId: selectUsers['userid']): Promise<selectPost[] | null> {
    try {
      // Assuming a 'likes' table exists where each like is linked to a post
      const results = await db
        .select({
          post_id: post.post_id,
          description: post.description,
          photo_url: post.photo_url,
          user_id: post.user_id,  // Make sure to include 'user_id' in the select statement
        })
        .from(post)
        .where(
          sql`EXISTS (
            SELECT 1
            FROM likes
            WHERE likes.user_id = ${userId} AND likes.post_id = ${post.post_id}
          )`
        )
        .execute();
  
      return results.length > 0 ? results : null; // Return null if no posts liked by the user
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve liked posts');
    }
  }  
  

  
  // Get all posts by a user ID
  async getAllPost(): Promise<selectPost[] | null> {
    try {
      const results = await db
        .select()
        .from(post)
        .execute();
  
      return results.length > 0 ? results : null; // Return null if no posts found
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }
}
