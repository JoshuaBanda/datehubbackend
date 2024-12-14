import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { insertPost, selectPost, post, usersTable, selectUsers } from 'src/db/schema';;
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
        username: user ? user.username : 'anonymous', // Query for username and fallback to 'anonymous' if not found
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
  
      // Query for usernames and fallback to 'anonymous' if user is not found
      const postsWithUsernames = await Promise.all(results.map(async (post) => {
        const [user] = await db
          .select({ username: usersTable.firstname })
          .from(usersTable)
          .where(eq(usersTable.userid, post.user_id))
          .execute();
        
        return {
          ...post,
          username: user ? user.username : 'anonymous', // Use real username or default to 'anonymous'
        };
      }));

      return postsWithUsernames;
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
  
      // Query for usernames and fallback to 'anonymous' if user is not found
      const postsWithUsernames = await Promise.all(results.map(async (post) => {
        const [user] = await db
          .select({ username: usersTable.firstname })
          .from(usersTable)
          .where(eq(usersTable.userid, post.user_id))
          .execute();
        
        return {
          ...post,
          username: user ? user.username : 'anonymous', // Use real username or default to 'anonymous'
        };
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

  async uploadImage(fileBuffer: Buffer, fileName: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          resource_type: 'auto',
          public_id: fileName, // Use fileName as public_id if desired
          folder: 'farmsmart' // Optionally specify a folder
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


async updateProfilePicture(email: string, profilepicture: string) {
  try {
    // Check if the email and name are valid (optional validation)


    if (!email || !profilepicture) {
      throw new Error('Invalid input data');
    }
    console.log('chec',email,profilepicture);

    // Perform the update operation
    const result = await db
      .update(usersTable)
      .set({ profilepicture: profilepicture })
      .where(eq(usersTable.email, email));

    // Check if any rows were updated (if result is empty, no matching user was found)
    if (result.count === 0) {
      throw new Error(`No user found with the email: ${email}`);
    }

    // Return a success message with the updated data
    return { message: ' updated successfully', updatedRows: result.count };
  } catch (error) {
    // Log the error and throw a more user-friendly error
    console.error('Error updating :', error);
    throw new Error('Failed to update . Please try again later.');
  }
}

}
