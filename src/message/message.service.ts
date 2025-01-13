import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { insertMessages, messagesTable, post, selectMessages, selectPost } from 'src/db/schema';
import { db } from 'src/db';
import { eq, gt, gte, sql } from 'drizzle-orm';
import { EventEmitter2 } from '@nestjs/event-emitter';

type MessageStatus = {
  id:number,
  status: string;
  inboxid:number;
  userid:number;

};

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
  

  async getMessagesStatus(inboxIds: string[]): Promise<MessageStatus[]> {
    try {
  
      const messages = await db
  .select()
  .from(messagesTable)
  .where(
    sql`${messagesTable.inboxid} IN (${sql.join(inboxIds.map(id => parseInt(id)), sql`,`)}) AND ${messagesTable.status} = 'sent'`
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
  
 
  
  async updateMessageStatus(id: number, status: string): Promise<any> {
    try {
      // Log the 'id' and 'status' before processing
      //console.log('Received message update request: ID:', id, 'Status:', status);
  
      // Validate that the 'id' is a valid number
      if (isNaN(id)) {
        console.error('Error: Invalid message ID', id);
        throw new Error('Invalid message ID');
      }
  
      // Validate that 'status' is a non-empty string (you can adjust this if needed)
      if (!status || typeof status !== 'string') {
        throw new Error('Invalid status value');
      }
  
      // Log the query details for debugging
      //console.log(`Attempting to update message with ID: ${id} to status: ${status}`);
  
      // Update the message's status in the database
      const result = await db
        .update(messagesTable)
        .set({ status: status })
        .where(eq(messagesTable.id, id)); // Use the number here
  
      // If no rows were updated, it means the message ID is not found
      if (result.count === 0) {
        console.error('No message found with ID:', id);
        throw new Error(`No message found with ID ${id}`);
      }
  
      return;
  
    } catch (error) {
      // Log and rethrow the error with a more specific message
      console.error('Error updating message:', error.message || error);
      throw new Error(`Failed to update message: ${error.message || 'Unknown error'}`);
    }
  }
  
  





  async updateMessage(id: number, message: string): Promise<any> {
    try {
      // Log the 'id' and 'status' before processing
      //console.log('Received message update request: ID:', id, 'Status:', status);
  
      // Validate that the 'id' is a valid number
      if (isNaN(id)) {
        console.error('Error: Invalid message ID', id);
        throw new Error('Invalid message ID');
      }
  
      // Validate that 'status' is a non-empty string (you can adjust this if needed)
      if (!message || typeof message !== 'string') {
        throw new Error('Invalid message value');
      }
  
  
      // Update the message's message in the database
      const result = await db
        .update(messagesTable)
        .set({ message : message })
        .where(eq(messagesTable.id, id)); // Use the number here
  
      // If no rows were updated, it means the message ID is not found
      if (result.count === 0) {
        console.error('No message found with ID:', id);
        throw new Error(`No message found with ID ${id}`);
      }
  
      return;
  
    } catch (error) {
      // Log and rethrow the error with a more specific message
      console.error('Error updating message:', error.message || error);
      throw new Error(`Failed to update message: ${error.message || 'Unknown error'}`);
    }
  }
  
  
}
