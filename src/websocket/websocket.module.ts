// src/websocket/websocket.module.ts
import { Module } from '@nestjs/common';
import { WebSocketGatewayService } from './websocket.gateway';

@Module({
  providers: [WebSocketGatewayService],
})
export class WebSocketModule {}
