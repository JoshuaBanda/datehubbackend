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
    origin: '*', // Adjust for production security
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers: Map<string, Socket> = new Map(); // Track connected users by userId

  // When a client connects
  handleConnection(client: Socket) {
    let userId = client.handshake.query.userId;

    // Ensure userId is a string (in case it's an array)
    if (Array.isArray(userId)) {
      console.log('Received an array for userId, taking the first element.');
      userId = userId[0]; // Use the first element if it's an array
    }

    if (!userId) {
      console.log('User ID missing');
      client.disconnect();
      return;
    }

    // Check if the user is already connected
    if (this.connectedUsers.has(userId)) {
      console.log(`User ${userId} is already connected. Disconnecting new connection.`);
      client.disconnect(); // Disconnect if the user is already connected
      return;
    }

    // Otherwise, register the user as connected
    this.connectedUsers.set(userId, client);
    console.log(`User ${userId} connected`);

    // Emit a message to all connected clients (or a specific user)
    this.server.emit('message', { message: 'User connected', userId });
  }

  // When a client disconnects
  handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()].find(([key, value]) => value === client)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId); // Remove user from connected map
      console.log(`User ${userId} disconnected`);
    }
  }

  // Custom event to refresh data
  @SubscribeMessage('triggerRefresh')
  handleRefresh(@MessageBody() data: any, client: Socket): void {
    console.log('Refreshing data:', data);

    // Emit to the specific user based on their socket ID
    if (client) {
      this.server.to(client.id).emit('refresh', { data });
    } else {
      // If no specific client, broadcast to all users
      this.server.emit('refresh', { data });
    }
  }
}
