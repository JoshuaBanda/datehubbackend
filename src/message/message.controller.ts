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
@Sse('event')
getAllMessageEvents(): Observable<any> {
  let lastTimestamp = new Date(0); // Start with the epoch time to get all messages initially

  return new Observable((observer) => {
    const intervalId = setInterval(async () => {
      try {
        // Fetch only new messages created after the last timestamp
        const newMessages = await this.messageService.getMessagesAfter(lastTimestamp);

        // Only send new messages if any were found
        if (newMessages && newMessages.length > 0) {
          // Update the last timestamp to the most recent message's createdAt
          const latestTimestamp = newMessages[newMessages.length - 1].createdat;
          lastTimestamp = new Date(latestTimestamp);  // Update the lastTimestamp to the most recent

          // Send the new messages to the client
          observer.next({ data: newMessages });
        }
      } catch (error) {
        observer.error(error);
      }
    }, 5000); // Send updates every second, but only for new messages

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
