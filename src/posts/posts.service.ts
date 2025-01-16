import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { selectPost, post, usersTable, insertPost, selectUsers, inboxParticipantsTable } from 'src/db/schema';
import { eq, gt, inArray, not, sql } from 'drizzle-orm';
import { db } from 'src/db';
import { PostTracker } from './post-tracker';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class PostService {
  private postTracker: PostTracker;
  // User-specific cache for posts
  private userCaches: Map<number, (selectPost & { username: string; lastname: string; profilepicture: string })[]> =
    new Map();

  constructor(
    
  private readonly notificationService: NotificationService,
  ) {
    
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
      const offset = (page - 1) * limit;
  
      // Retrieve cached posts for the user
      const cachedPosts = this.userCaches.get(userId) || [];
      
      // Filter out posts that have already been sent
      const unsentCachedPosts = cachedPosts.filter(
        (post) => !this.postTracker.getSentPostIds(userId).includes(post.post_id)
      );
  
      // If unsent posts are available in the cache, return them
      if (unsentCachedPosts.length > 0) {
        //console.log(`Returning ${unsentCachedPosts.length} cached posts for user ${userId}`);
        const paginatedPosts = unsentCachedPosts.slice(offset, offset + limit);
        this.postTracker.markPostsAsSent(userId, paginatedPosts); // Mark posts as sent
        return paginatedPosts;
      }
  
      // If no unsent posts are found, fetch new posts from the database
      //console.log(`No unsent cached posts for user ${userId}`);
      
      const results = await db
        .select()
        .from(post)
        .where(not(inArray(post.post_id, this.postTracker.getSentPostIds(userId)))) // Filter out already sent posts
        .limit(limit)
        .offset(offset)
        .execute();
  
      if (results.length === 0) {
        //console.log(`No new posts available for user ${userId}. Clearing tracker.`);
        this.postTracker.clearSentPosts(userId); // Clear the tracker if no new posts are found
        return null; // Return null when no new posts are available
      }
  
      // Append new posts to the cache and mark them as sent
      const postsWithUserDetails = await this.fetchPostsWithUserDetails(results);
      //console.log(`Updating cache and tracker for user ${userId}`);
      
      // Append the new posts to the existing cache (avoiding overwriting)
      const updatedCache = [...cachedPosts, ...postsWithUserDetails];
      this.userCaches.set(userId, updatedCache);
      this.postTracker.markPostsAsSent(userId, results);
  
      return postsWithUserDetails;
    } catch (error) {
      console.error(`Error fetching posts for user ${userId}:`, error);
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
    //console.log('Updating post caches for all users...');

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

      //console.log('Post caches updated successfully');
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
    //console.log(`Clearing cache for user ${userId}`);
    this.userCaches.delete(userId);
  }

  // Clear the caches for all users
  clearAllCaches(): void {
    //console.log('Clearing caches for all users');
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
          //console.log('Cloudinary upload result:', result); // Log the result
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

        console.log(newPost);
        //destructuring the post

        const {
          post_id,
          description,
          photo_url,
          photo_public_id,
          user_id,
          created_at,
        } = newPost;
    
        // Optionally log the destructured values to check
        console.log('Destructured post:', {
          post_id,
          description,
          photo_url,
          photo_public_id,
          user_id,
          created_at,
        });

        const friendsToRecieveNotifications=await this.getFriends(user_id);
        console.log('friendsToRecieveNotifications',friendsToRecieveNotifications);

        await this.notificationService.createNotificationsForFriends(friendsToRecieveNotifications);

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
      console.error('Error updating :', error);
      throw new Error('Failed to update. Please try again later.');
    }
  }

  
    // Fetch messages created after the given timestamp
    async getPostAfter(lastTimestamp: Date): Promise<selectPost[]> {
      try {
        //console.log('Fetching posts after timestamp:', lastTimestamp); // Log the input timestamp
    
        // Query the database for posts that have a 'createdAt' timestamp greater than the lastTimestamp
        const result = await db
          .select()
          .from(post)
          .where(gt(post.created_at, lastTimestamp))  // Exclude posts equal to lastTimestamp
          .orderBy(post.created_at) // Ensure posts are ordered by timestamp in ascending order
          .execute();
    
        // Log the query result before returning
        //console.log('Fetched posts:', result); // Log the result from the database query
    
        return result;  // Return the result
      } catch (error) {
        console.error('Error fetching post after timestamp:', error); // Log any error that occurs during the query
        throw new Error('Failed to fetch post after the specified timestamp');
      }
    }



    async getFriends(id: number) {
        try {
          // Execute the query
          const result = await db
            .select({
              friendId: sql`CASE 
                              WHEN ${inboxParticipantsTable.firstuserid} = ${id} THEN ${inboxParticipantsTable.seconduserid}
                              WHEN ${inboxParticipantsTable.seconduserid} = ${id} THEN ${inboxParticipantsTable.firstuserid}
                            END`
            })
            .from(inboxParticipantsTable)
            .where(
              sql`(${inboxParticipantsTable.firstuserid} = ${id} OR ${inboxParticipantsTable.seconduserid} = ${id})`
            )
            .execute();
      
          // If no results are found, throw an error
          if (result.length === 0) {
            throw new NotFoundException(`No friends found for user with id: ${id}`);
          }
      
          // Map over the result to extract the 'friendId'
          const friends = result.map((item: { friendId: number | null }) => item.friendId);
      
          // Filter out null values
          return friends.filter(friendId => friendId !== null);
      
        } catch (error) {
          // Handle any errors
          throw new InternalServerErrorException('Failed to retrieve friends');
        }
      }
      


  
}

