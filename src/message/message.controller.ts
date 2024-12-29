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

  // SSE Endpoint for streaming all messages from all inboxes
  @Sse('events')
getAllMessageEvents(): Observable<any> {
  let lastTimestamp = new Date(0); // Start with the epoch time to get all messages initially
  console.log(`Starting SSE stream with initial timestamp: ${lastTimestamp.toISOString()}`);

  return new Observable((observer) => {
    const intervalId = setInterval(async () => {
      try {
        console.log(`Fetching messages after: ${lastTimestamp.toISOString()}`);
        const newMessages = await this.messageService.getMessagesAfter(lastTimestamp);

        if (newMessages && newMessages.length > 0) {
          console.log(`Fetched ${newMessages.length} new message(s)`);

          // Get the most recent message's timestamp
          const latestMessage = newMessages[newMessages.length - 1];
          const latestTimestamp = new Date(latestMessage.createdat);
          console.log(`Latest message timestamp: ${latestTimestamp.toISOString()}`);

          // Add a margin to the timestamp to ensure that we don't miss any messages
          lastTimestamp = new Date(latestTimestamp.getTime() + 1); // Add 1 ms margin
          console.log(`Sending new messages to client: ${JSON.stringify(newMessages)}`);
          observer.next({ data: newMessages });
        } else {
          console.log(`No new messages to fetch.`);
        }
      } catch (error) {
        console.error(`Error fetching messages:`, error);
        observer.error(error);
      }
    }, 1000); // Every second

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
