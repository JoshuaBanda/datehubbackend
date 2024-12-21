import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { selectPost, post, usersTable, insertPost, selectUsers } from 'src/db/schema';
import { eq, inArray, not, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { PostTracker } from './post-tracker';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';

@Injectable()
export class PostService {
  private postTracker: PostTracker;
  // User-specific cache for posts
  private userCaches: Map<number, (selectPost & { username: string; lastname: string; profilepicture: string })[]> =
    new Map();

  constructor() {
    v2.config({
      cloud_name: 'dfahzd3ky',
      api_key: '377379954858251',
      api_secret: 'Cxu4QkxXCmd400-VWttlRZ_w9p8',
    });
    this.postTracker = new PostTracker();
  }
 


  async getPosts(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<(selectPost & { username: string; lastname: string; profilepicture: string })[] | null> {
    try {
      // Check if the user has a cached post list
      if (this.userCaches.has(userId)) {
        console.log(`Fetching posts from cache for user ${userId}`);
        const userCache = this.userCaches.get(userId) || [];
        const filteredCache = userCache.filter(
          (post) => !this.postTracker.getSentPostIds(userId).includes(post.post_id)
        );
  
        if (filteredCache.length > 0) {
          const offset = (page - 1) * limit;
          return filteredCache.slice(offset, offset + limit);
        }
      }
  
      // Fetch posts from the database if no suitable cached posts are available
      const offset = (page - 1) * limit;
      const results = await db
        .select()
        .from(post)
        .where(not(inArray(post.post_id, this.postTracker.getSentPostIds(userId))))
        .limit(limit)
        .offset(offset)
        .execute();
  
      if (results.length === 0) {
        // Clear the post tracker if no posts are left
        this.postTracker.clearSentPosts(userId);
        return null;
      }
  
      console.log(`Fetching posts from database for user ${userId}`);
      const postsWithUserDetails = await this.fetchPostsWithUserDetails(results);
  
      // Cache the fetched posts for the user
      this.userCaches.set(userId, postsWithUserDetails);
  
      // Track these posts as sent for the user
      this.postTracker.markPostsAsSent(userId, results);
  
      return postsWithUserDetails;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }
  
  private async fetchPostsWithUserDetails(
    posts: selectPost[]
  ): Promise<(selectPost & { username: string; lastname: string; profilepicture: string })[]> {
    return await Promise.all(
      posts.map(async (post) => {
        const [user] = await db
          .select({
            firstname: usersTable.firstname,
            lastname: usersTable.lastname,
            profilepicture: usersTable.profilepicture,
          })
          .from(usersTable)
          .where(eq(usersTable.userid, post.user_id))
          .execute();

        return {
          ...post,
          username: user ? user.firstname : 'anonymous',
          lastname: user ? user.lastname : '',
          profilepicture: user ? user.profilepicture : '',
        };
      })
    );
  }

  // Method to update the cache for all users
  async updateCache(): Promise<void> {
    console.log('Updating post caches for all users...');

    try {
      const allPosts = await db.select().from(post).execute();
      const postsWithUserDetails = await this.fetchPostsWithUserDetails(allPosts);

      // Update cache for each user individually
      this.userCaches.forEach((_, userId) => {
        this.userCaches.set(
          userId,
          postsWithUserDetails.filter(
            (post) => !this.postTracker.getSentPostIds(userId).includes(post.post_id)
          )
        );
      });

      console.log('Post caches updated successfully');
    } catch (error) {
      console.error('Failed to update post caches:', error);
    }
  }

  // Schedule the cache update to run every minute
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledCacheUpdate(): Promise<void> {
    await this.updateCache();
  }

  // Clear the cache for a specific user
  clearUserCache(userId: number): void {
    console.log(`Clearing cache for user ${userId}`);
    this.userCaches.delete(userId);
  }

  // Clear the caches for all users
  clearAllCaches(): void {
    console.log('Clearing caches for all users');
    this.userCaches.clear();
  }



  //the previous implements
  

  async  uploadImage(fileBuffer: Buffer, fileName: string, quality: number): Promise<UploadApiResponse | UploadApiErrorResponse> {
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
          console.log('Cloudinary upload result:', result); // Log the result
          resolve(result);
        }
      );
  
      uploadStream.end(fileBuffer); // End the stream with the buffer
    });
  }
  
  

  // Create a new post
  async createPost(data: insertPost): Promise<selectPost | null> {
    try {
      const [newPost] = await db
        .insert(post)
        .values(data)
        .returning(); // Returning the newly inserted post
  
      return newPost; // Return the inserted post data
    } catch (error) {
      throw new InternalServerErrorException('Failed to create post', error);
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
  async getPostsByUser(userId: selectUsers['userid']): Promise<(selectPost & { username: string, lastname: string, profilepicture: string })[] | null> {
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
  
      // Fetching the username (firstname, lastname) and profile picture for that user
      const [user] = await db
        .select({
          firstname: usersTable.firstname,
          lastname: usersTable.lastname,
          profilepicture: usersTable.profilepicture,
        })
        .from(usersTable)
        .where(eq(usersTable.userid, userIdFromPost))
        .execute();
  
      // Map posts and ensure that every post has a username and other fields
      const postsWithUserDetails = results.map(post => ({
        ...post, // Spread the existing post fields
        username: user ? user.firstname : 'anonymous', // Query for username (firstname)
        lastname: user ? user.lastname : '', // Query for lastname
        profilepicture: user ? user.profilepicture : '', // Query for profilepicture
      }));
  
      return postsWithUserDetails; // Return posts with username, lastname, and profile picture
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }

  // Get posts liked by a user


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


  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
        v2.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
            if (error) {
                console.error('Cloudinary delete error:', error); // Log detailed error
                return reject(error);
            }
            console.log('Cloudinary delete result:', result);
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
      console.log('chec', email, profilepicture);

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
      console.error('Error updating :', error);
      throw new Error('Failed to update. Please try again later.');
    }
  }

}

