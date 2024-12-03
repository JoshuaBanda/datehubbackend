import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { ChatGateway } from '../websocket/websocket.gateway';

@Module({
  controllers: [MessageController],
  providers: [MessageService,ChatGateway],
})
export class MessageModule {}
