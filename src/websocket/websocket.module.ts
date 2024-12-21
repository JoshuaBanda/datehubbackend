// src/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { ChatGateway } from './websocket.gateway';

@Module({
  providers: [ChatGateway ],
})
export class WebSocketModule {}
