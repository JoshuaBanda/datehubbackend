import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { insertPost, selectPost, post, usersTable, selectUsers } from 'src/db/schema';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from "cloudinary";
import { eq, sql } from "drizzle-orm";
import { db } from "src/db";

@Injectable()
export class PostService {
  constructor() {
    v2.config({
      cloud_name: 'dfahzd3ky',
      api_key: '377379954858251',
      api_secret: 'Cxu4QkxXCmd400-VWttlRZ_w9p8',
    });
  }


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
  async getPostsLikedByUser(userId: selectUsers['userid']): Promise<(selectPost & { username: string, lastname: string, profilepicture: string })[] | null> {
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
  
      // Query for user details (username, lastname, profilepicture) and fallback to defaults if not found
      const postsWithUserDetails = await Promise.all(results.map(async (post) => {
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
          username: user ? user.firstname : 'anonymous', // Use firstname for username
          lastname: user ? user.lastname : '', // Use lastname
          profilepicture: user ? user.profilepicture : '', // Use profile picture
        };
      }));

      return postsWithUserDetails;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to retrieve liked posts');
    }
  }

  // Get all posts
  async getAllPost(): Promise<(selectPost & { username: string, lastname: string, profilepicture: string })[] | null> {
    try {
      const results = await db
        .select()
        .from(post)
        .execute();
  
      // If no posts are found, return null
      if (results.length === 0) {
        return null;
      }
  
      // Query for user details (username, lastname, profilepicture) and fallback to defaults if not found
      const postsWithUserDetails = await Promise.all(results.map(async (post) => {
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
          username: user ? user.firstname : 'anonymous', // Use firstname for username
          lastname: user ? user.lastname : '', // Use lastname
          profilepicture: user ? user.profilepicture : '', // Use profile picture
        };
      }));

      return postsWithUserDetails;
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
