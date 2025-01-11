import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { insertMessages, messagesTable, post, selectMessages, selectPost } from 'src/db/schema';
import { db } from 'src/db';
import { eq, gt, gte, sql } from 'drizzle-orm';
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
      //this.eventEmitter.emit('message.added', message);
  
      //console.log('Message added:', message);
  
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

  async getMessagesAfter(lastTimestamp: Date, inboxIds: string[]): Promise<selectMessages[]> {
    try {
      const lastTimestampString = lastTimestamp.toISOString(); // Convert Date to string
  
      const messages = await db
  .select()
  .from(messagesTable)
  .where(
    sql`${messagesTable.createdat} > ${lastTimestampString} AND ${messagesTable.inboxid} IN (${sql.join(inboxIds.map(id => parseInt(id)), sql`,`)}) AND ${messagesTable.status} = 'sent'`
  )
  .orderBy(messagesTable.createdat)
  .execute();

      return messages; // Return the result
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
  
 
  
  async updateMessage(id: string, status: string): Promise<any> {
    try {
      // Ensure that the 'id' is treated as a number
      const messageId = parseInt(id, 10); // Convert the id to a number
  
      // Validate that the messageId is a valid number
      if (isNaN(messageId)) {
        throw new Error('Invalid message ID');
      }
  
      // Update the message's status
      const result = await db
        .update(messagesTable)
        .set({ status: status })
        .where(eq(messagesTable.id, messageId)); // Use the number here
  
      // Check if any row was updated
      if (result.count === 0) {
        throw new Error('Message not found');
      }
  
      // Fetch and return the updated message
      const updatedMessage = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.id, messageId))
        .execute();
  
      return updatedMessage[0]; // Return the updated message
  
    } catch (error) {
      console.error('Error updating message:', error);
      throw new Error('Failed to update message');
    }
  }
  

  
}
