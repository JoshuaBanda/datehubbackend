import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { insertMessages, messagesTable, selectMessages } from 'src/db/schema';
import { db } from 'src/db';
import { eq } from 'drizzle-orm';
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

      return message;
    } catch (error) {
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
}
