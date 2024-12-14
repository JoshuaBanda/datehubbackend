import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { insertPost, selectPost, post, usersTable, selectUsers } from 'src/db/schema';
import { db } from 'src/db';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PostService {

  // Create a new post
  async createPost(data: insertPost): Promise<selectPost | null> {
    try {
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
  async getPostsByUser(userId: selectUsers['userid']): Promise<(selectPost & { username: string })[] | null> {
    try {
      const results = await db
        .select()
        .from(post)
        .where(eq(post.user_id, userId))
        .execute();
  
      // If no posts are found, return null
      if (results.length === 0) {
        return null;
      }
  
      const userIdFromPost = results[0].user_id; // Access user_id from the first post
  
      // Fetching the username for that user
      const [user] = await db
        .select({ username: usersTable.firstname }) // Fetch the username (using firstname as per your query)
        .from(usersTable)
        .where(eq(usersTable.userid, userIdFromPost))
        .execute();
  
      // Map posts and ensure that every post has a username
      const postsWithUsernames = results.map(post => ({
        ...post, // Spread the existing post fields
        username: user ? user.username : 'anonymous', // If user found, use username, otherwise set 'anonymous'
      }));
  
      return postsWithUsernames; // Return posts with the username (either real or 'anonymous')
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }

  // Get posts liked by a user
  async getPostsLikedByUser(userId: selectUsers['userid']): Promise<(selectPost & { username: string })[] | null> {
    try {
      const results = await db
        .select({
          post_id: post.post_id,
          description: post.description,
          photo_url: post.photo_url,
          user_id: post.user_id, // Make sure to include 'user_id' in the select statement
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
  
      // If no posts liked, return null
      if (results.length === 0) {
        return null;
      }
  
      // Adding username fallback if no user is found for any post
      const postsWithUsernames = results.map(post => ({
        ...post, 
        username: 'anonymous', // Default username if no user found (since likes table may not have user data)
      }));

      return postsWithUsernames; // Return liked posts with 'anonymous' username
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve liked posts');
    }
  }

  // Get all posts
  async getAllPost(): Promise<(selectPost & { username: string })[] | null> {
    try {
      const results = await db
        .select()
        .from(post)
        .execute();
  
      // If no posts are found, return null
      if (results.length === 0) {
        return null;
      }
  
      // Assuming we want to add 'anonymous' username in case no user exists
      const postsWithUsernames = results.map(post => ({
        ...post,
        username: 'anonymous', // Default to 'anonymous' for all posts if username isn't fetched
      }));

      return postsWithUsernames;
    } catch (error) {
      console.error(error);
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
}
