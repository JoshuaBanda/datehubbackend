import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',  // Allow any origin, adjust for security in production
  },
})
export class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: Map<string, Socket> = new Map(); // Map userId to socket connection

  @WebSocketServer() server: Server;

  // Called when a client connects
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;  // Assuming userId is passed in the handshake query

    console.log(`Attempting to connect client with userId: ${userId}`);

    if (!userId) {
      console.log('User ID is missing in the connection request');
      client.emit('error', 'User ID is required');
      client.disconnect();
      return;
    }

    if (this.clients.has(userId)) {
      // If the user is already connected, disconnect the previous socket
      const existingSocket = this.clients.get(userId);
      if (existingSocket) {
        console.log(`Disconnecting previous socket for user: ${userId} (Socket ID: ${existingSocket.id})`);
        existingSocket.disconnect(true);  // Forcefully disconnect the previous socket
      }
    }

    // Add the new socket connection for the user
    this.clients.set(userId, client);
    console.log(`Client connected: ${userId} (Socket ID: ${client.id})`);
  }

  // Called when a client disconnects
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.clients.entries()).find(([_, socket]) => socket.id === client.id)?.[0];

    if (userId) {
      this.clients.delete(userId);
      console.log(`Client disconnected: ${userId} (Socket ID: ${client.id})`);
    }
  }
}
