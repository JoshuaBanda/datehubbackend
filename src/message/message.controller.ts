import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Sse } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { insertMessages, selectMessages } from 'src/db/schema';
import { Observable } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('send')
  async createMessage(@Body() CreateMessageDto: insertMessages) {
    try {
      const result = await this.messageService.addMessage(CreateMessageDto);

      // Emit the 'message.added' event after adding a message
      this.eventEmitter.emit('message.added', result);

      return result;
    } catch (error) {
      throw new HttpException('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/message')
  async getMessagesByInboxId(@Param('id') id: number): Promise<selectMessages[]> {
    try {
      return await this.messageService.getMessagesByInboxId(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // SSE Endpoint for real-time message updates
  @Sse('events') // SSE endpoint
  getMessageEvents(): Observable<any> {
    return new Observable((observer) => {
      // Handle the SSE connection and push updates
      const intervalId = setInterval(async () => {
        try {
          const messages = await this.messageService.getMessagesByInboxId(1); // Example inbox id
          observer.next({ data: messages }); // Send the message data to the client
        } catch (error) {
          observer.error(error);
        }
      }, 1000); // Send updates every second, you can adjust the interval

      // Cleanup logic when the client disconnects
      return () => {
        clearInterval(intervalId);
      };
    });
  }
}
