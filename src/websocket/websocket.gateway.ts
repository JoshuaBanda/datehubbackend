import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',  // Allow any origin, adjust for security in production
  },
})
export class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  private clients: Set<Socket> = new Set();

  @WebSocketServer() server: Server;

  // Called when a client connects
  handleConnection(client: Socket) {
    this.clients.add(client);
    console.log(`Client connected: ${client.id}`);
  }

  // Called when a client disconnects
  handleDisconnect(client: Socket) {
    this.clients.delete(client);
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('triggerRefresh')
  handleRefresh(@MessageBody() message: any, @ConnectedSocket() senderSocket: Socket): void {
    console.log('Received refresh request:', message);

    // Add timestamp to the data
    const createdat = new Date().toISOString(); // Current timestamp in ISO format
    const data = {
      ...message,  // Existing data
      createdat, // Add timestamp to data
    };
    console.log('Data with timestamp:', data);

    // Emit refresh event to all connected clients except the sender
    this.clients.forEach((client) => {
      if (client.id !== senderSocket.id) { // Skip the sender
        client.emit('refresh', { data });
      }
    });
  }
}