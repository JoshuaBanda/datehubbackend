import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { db } from 'src/db';
import { confession_comments, insertconfessionComments, selectconfessionComments, usersTable, confession, selectConfession, selectUsers } from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class ConfessionCommentsService {
  
  // Add a comment to a confession
  async addComment(data: insertconfessionComments): Promise<selectconfessionComments> {
    try {
      const [comment] = await db
        .insert(confession_comments)
        .values({
          confession_comment: data.confession_comment,
          confession_id: data.confession_id,
          user_id: data.user_id,
        })
        .returning();
  
      return comment;
    } catch (error) {
      console.error('Error inserting comment:', error);
      throw new InternalServerErrorException('Failed to add comment');
    }
  }
  

  // Get all comments for a specific confession
  async getCommentsByConfession(confessionId: selectConfession['confession_id']): Promise<any | null> {
    try {
      const commentsResult = await db
        .select()
        .from(confession_comments)
        .where(eq(confession_comments.confession_id, confessionId))
        .execute();
  
      if (commentsResult.length === 0) {
        return null;
      }
  
      const commentsWithUserInfo = await Promise.all(
        commentsResult.map(async (comment) => {
          const [user] = await db
            .select({ username: usersTable.firstname, lastname: usersTable.lastname, profilepicture: usersTable.profilepicture })
            .from(usersTable)
            .where(eq(usersTable.userid, comment.user_id))
            .execute();
  
          return {
            ...comment,
            username: user ? `${user.username} ${user.lastname}` : 'Anonymous',
            profilepicture: user ? user.profilepicture : null,
          };
        })
      );
  
      return commentsWithUserInfo;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments with user information');
    }
  }
  

  // Get a comment by its ID
  async getCommentById(commentId: selectconfessionComments['confession_comment_id']): Promise<selectconfessionComments | null> {
    try {
      const [comment] = await db
        .select()
        .from(confession_comments)
        .where(eq(confession_comments.confession_comment_id, commentId))
        .execute();

      return comment || null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comment');
    }
  }

  // Get comments by a user
  async getCommentsByUser(userId: selectUsers['userid']): Promise<selectconfessionComments[] | null> {
    try {
      const result = await db
        .select()
        .from(confession_comments)
        .where(eq(confession_comments.user_id, userId))
        .execute();

      return result.length > 0 ? result : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments by user');
    }
  }

  // Delete a comment by ID
  async deleteComment(commentId: selectconfessionComments['confession_comment_id']): Promise<void> {
    try {
      const result = await db
        .delete(confession_comments)
        .where(eq(confession_comments.confession_comment_id, commentId))
        .execute();

      if (result.count === 0) {
        throw new NotFoundException(`Comment with ID ${commentId} not found`);
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }

  // Edit a comment
  async updateComment(
    confession_commentId: selectconfessionComments['confession_comment_id'],
    newconfession_Comment: string
  ): Promise<selectconfessionComments | null> {
    try {
      const result = await db
        .update(confession_comments)
        .set({ confession_comment: newconfession_Comment })
        .where(eq(confession_comments.confession_comment_id, confession_commentId))
        .returning();

      if (result.length === 0) {
        throw new NotFoundException(`Comment with ID ${confession_commentId} not found`);
      }

      return result[0];
    } catch (error) {
      throw new InternalServerErrorException('Failed to update comment');
    }
  }

  // Get comments for a confession with user info (join users table)
  async getCommentsWithUserInfo(confessionId: selectConfession['confession_id']): Promise<any> {
    try {
      const result = await db
        .select({
          comment_id: confession_comments.confession_comment_id,
          comment: confession_comments.confession_comment,
          user_id: confession_comments.user_id,
          firstname: usersTable.firstname,
          lastname: usersTable.lastname,
          profilepicture: usersTable.profilepicture,
        })
        .from(confession_comments)
        .leftJoin(usersTable, eq(confession_comments.user_id, usersTable.userid))
        .where(eq(confession_comments.confession_id, confessionId))
        .execute();

      return result.length > 0 ? result : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve comments with user info');
    }
  }
}
