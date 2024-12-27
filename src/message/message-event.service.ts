import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MessageController } from './message.controller';

@Injectable()
export class MessageEventService {
  constructor(private messageController: MessageController) {}

  @OnEvent('message.added') // Listening for the 'message.added' event
  handleNewMessageEvent(message: any) {
    // Push new message to connected SSE clients
    console.log('New message added:', message);
    // Here you could push the message to an SSE or websocket handler
  }
}
