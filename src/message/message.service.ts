import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { insertMessages, messagesTable, post, selectMessages, selectPost } from 'src/db/schema';
import { db } from 'src/db';
import { eq, gt, gte } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessageService {
  constructor(private eventEmitter: EventEmitter2) {}

  async addMessage(data: insertMessages) {
    try {
      const [message] = await db
        .insert(messagesTable)
        .values(data)
        .returning();
  
      // Emit the 'message.added' event with the new message
      this.eventEmitter.emit('message.added', message);
  
      console.log('Message added:', message);
  
      return message;
    } catch (error) {
      console.error('Error in addMessage:', error);  // Log the error to get more insight
      throw new InternalServerErrorException('Failed to send message');
    }
  }
  
  async getMessagesByInboxId(id: number): Promise<selectMessages[] | null> {
    return await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.inboxid, id))
      .execute();
  }

  // Fetch messages created after the given timestamp
  async getMessagesAfter(lastTimestamp: Date): Promise<selectMessages[]> {
    try {
      // Query the database for messages that have a 'createdAt' timestamp greater than the lastTimestamp
      const messages = await db
        .select()
        .from(messagesTable)
        .where(gt(messagesTable.createdat, lastTimestamp))  // Exclude messages equal to lastTimestamp
        .orderBy(messagesTable.createdat) // Ensure messages are ordered by timestamp in ascending order
        .execute();
  
      return messages;  // Return the result
    } catch (error) {
      console.error('Error fetching messages after timestamp:', error);
      throw new Error('Failed to fetch messages after the specified timestamp');
    }
  }

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
      //console.error('Error fetching post after timestamp:', error); // Log any error that occurs during the query
      throw new Error('Failed to fetch post after the specified timestamp');
    }
  }
  
  
}
