// MessageController.ts
import { Controller, Post, Body, HttpException, HttpStatus, Sse, Param, Get } from '@nestjs/common';
import { MessageService } from './message.service';
import { insertMessages, selectMessages } from 'src/db/schema';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Endpoint to send a message
  @Post('send')
  async createMessage(@Body() CreateMessageDto: insertMessages) {
    try {
      console.log('j');
      // Add the message to the database
      const result = await this.messageService.addMessage(CreateMessageDto);
      

      // Emit the 'message.added' event after adding a message
      this.eventEmitter.emit('message.added', result);

      return result;
    } catch (error) {
      throw new HttpException('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Sse('event')
  getAllMessageEvents(): Observable<any> {
    let lastTimestamp = new Date(0); // Start with the epoch time to get all messages initially
    let lastEmittedMessageIds: Set<string> = new Set(); // Track already emitted message IDs to avoid duplicates
  
    return new Observable((observer) => {
      const intervalId = setInterval(async () => {
        try {
          // Fetch only new messages created after the last timestamp
          const newMessages = await this.messageService.getMessagesAfter(lastTimestamp);
  
          // Only send new messages if any were found
          if (newMessages && newMessages.length > 0) {
            // Filter out messages that have already been emitted using a unique identifier (e.g., message ID or timestamp)
            const uniqueMessages = newMessages.filter((message) => {
              const messageId = message.createdat.toISOString(); // Convert Date to string using toISOString()
              return !lastEmittedMessageIds.has(messageId);
            });
  
            if (uniqueMessages.length > 0) {
              // Update the last timestamp to the most recent message's createdAt
              const latestTimestamp = newMessages[newMessages.length - 1].createdat;
              lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent
  
              // Emit new messages and track their message IDs to avoid re-emission
              uniqueMessages.forEach((message) => {
                const messageId = message.createdat.toISOString(); // Convert Date to string
                lastEmittedMessageIds.add(messageId);  // Add the message's timestamp (as string) to the set
              });
  
              // Send the new messages to the client
              observer.next({ data: uniqueMessages });
            }
          }
        } catch (error) {
          observer.error(error);
        }
      }, 5000); // Send updates every 5 seconds, but only for new messages
  
      return () => {
        clearInterval(intervalId);
      };
    });
  }
  


  // Endpoint to retrieve all messages by inbox ID
  @Get(':id/messages')
  async getMessagesByInboxId(@Param('id') id: number): Promise<selectMessages[]> {
    try {
      return await this.messageService.getMessagesByInboxId(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
