import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { WebSocketGatewayService } from '../websocket/websocket.gateway';

@Module({
  controllers: [MessageController],
  providers: [MessageService,WebSocketGatewayService],
})
export class MessageModule {}
