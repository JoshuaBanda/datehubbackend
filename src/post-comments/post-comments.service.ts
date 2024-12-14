import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { comments, insertComments, selectComments, usersTable, post, selectPost, selectUsers } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class PostCommentsService {
  
  // Add a comment to a post
  async addComment(data: insertComments): Promise<selectComments> {
    try {
      // Insert a new comment and return the inserted comment
      const [comment] = await db
        .insert(comments)
        .values({
          comment: data.comment,  // Only include the necessary fields
          post_id: data.post_id,  // Make sure to pass the post ID
          user_id: data.user_id,  // Make sure to pass the user ID
        })
        .returning();  // Return the inserted row, including `comment_id`
  
      return comment;  // Return the created comment
    } catch (error) {
      console.error('Error inserting comment:', error);  // Log the error for debugging
      throw new InternalServerErrorException('Failed to add comment');
    }
  }
  

  // Get all comments for a specific post
  async getCommentsByPost(postId: selectPost['post_id']): Promise<selectComments[] | null> {
    try {
      const commentsResult = await db
        .select()
        .from(comments)
        .where(eq(comments.post_id, postId)) // Filter by post_id
        .execute();

      return commentsResult.length > 0 ? commentsResult : null; // Return comments or null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments');
    }
  }

  // Get a comment by its ID
  async getCommentById(commentId: selectComments['comment_id']): Promise<selectComments | null> {
    try {
      const [comment] = await db
        .select()
        .from(comments)
        .where(eq(comments.comment_id, commentId))
        .execute();

      return comment || null; // Return the comment if found, else null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comment');
    }
  }

  // Get comments by a user
  async getCommentsByUser(userId: selectUsers['userid']): Promise<selectComments[] | null> {
    try {
      const result = await db
        .select()
        .from(comments)
        .where(eq(comments.user_id, userId)) // Filter by user_id
        .execute();

      return result.length > 0 ? result : null; // Return user's comments or null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments by user');
    }
  }

  // Delete a comment by ID
async deleteComment(commentId: selectComments['comment_id']): Promise<void> {
  try {
    const result = await db
      .delete(comments) // Specify the table (comments)
      .where(eq(comments.comment_id, commentId)) // Add the where condition
      .execute(); // Execute the delete query

    if (result.count === 0) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }
  } catch (error) {
    throw new InternalServerErrorException('Failed to delete comment');
  }
}


  // Edit a comment
  async updateComment(
    commentId: selectComments['comment_id'],
    newComment: string
  ): Promise<selectComments | null> {
    try {
      // Update the comment content
      const result = await db
        .update(comments)
        .set({ comment: newComment })
        .where(eq(comments.comment_id, commentId))
        .returning();

      if (result.length === 0) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }

      return result[0]; // Return the updated comment
    } catch (error) {
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  // Get comments for a post with user info (join users table)
  async getCommentsWithUserInfo(postId: selectPost['post_id']): Promise<any> {
    try {
      const result = await db
        .select({
          comment_id: comments.comment_id,
          comment: comments.comment,
          user_id: comments.user_id,
          firstname: usersTable.firstname,
          lastname: usersTable.lastname,
          profilepicture: usersTable.profilepicture,
        })
        .from(comments)
        .leftJoin(usersTable, eq(comments.user_id, usersTable.userid)) // Left join to get user info
        .where(eq(comments.post_id, postId)) // Filter by post ID
        .execute();

      return result.length > 0 ? result : null; // Return comments with user info or null
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments with user info');
    }
  }
}
