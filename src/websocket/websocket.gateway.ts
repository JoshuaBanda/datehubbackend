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
    origin: '*', // Allow all origins during development
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers: Map<string, Socket> = new Map(); // Track connected users by userId

  // When a client connects
  handleConnection(client: Socket) {
    let userId = client.handshake.query.userId;

    // Ensure that userId is a string (in case it's received as a number or an array)
    if (Array.isArray(userId)) {
   //   console.log('Received an array for userId, taking the first element.');
      userId = userId[0]; // Use the first element if it's an array
    }

    // Check if the user is already connected
    if (this.connectedUsers.has(userId)) {
    //  console.log(`User ${userId} is already connected.`);
    }

    // Register the user as connected
    this.connectedUsers.set(userId, client);
   // console.log(`User ${userId} connected`);

    // Emit a message to all connected clients (or a specific user)
    this.server.emit('message', { message: 'online', userId });
  }

  // When a client disconnects
  handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()].find(([key, value]) => value === client)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId); // Remove user from connected map
    //  console.log(`User ${userId} disconnected`);
    }
  }

  // Handle both messages and posts using a 'type' field to differentiate them
  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() msg: any): void {
    const { type, content, userId } = msg;

    if (type === 'message') {
    //  console.log(`Received message: ${content} from user ${userId}`);
      // Handle message logic, e.g., store in database, broadcast to clients
      this.server.emit('message', { content, userId, type, timestamp: new Date().toISOString() });
    } else if (type === 'post') {
     // console.log(`Received post: ${content} from user ${userId}`);
      // Handle post logic, e.g., store in database, broadcast to clients
      this.server.emit('post', { content, userId, type, timestamp: new Date().toISOString() });
    } else {
    //  console.log(`Unknown type: ${type}`);
    }
  }

  // Example of refreshing data (already in your existing code)
  @SubscribeMessage('triggerRefresh')
  handleRefresh(@MessageBody() msg: any): void {
   // console.log('Refreshing data:', msg);

    // Set the `createdat` timestamp to the current time
    const createdAt = new Date().toISOString();

    // Prepare the data to be emitted
    const data = { ...msg, createdat: createdAt };

    // Emit the 'refresh' event with the data to all connected clients
    this.server.emit('refresh', { data });
  }
}
