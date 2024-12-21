import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway(3001, {
    cors: {
      origin: '*', // Allow all origins during development
    },
  })
  export class MyGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private connectedUsers: Map<string, Socket> = new Map(); // Track connected users by userId
  
    // When a client connects
    handleConnection(client: Socket) {
      let userId = client.handshake.query.userId;
  
      // Ensure that userId is a string (in case it's received as a number or an array)
      if (Array.isArray(userId)) {
        console.log('Received an array for userId, taking the first element.');
        userId = userId[0]; // Use the first element if it's an array
      }
  
      if (!userId) {
        console.log('Invalid or missing userId, disconnecting client.');
        client.disconnect(true);
        return;
      }
  
      // Check if the user is already connected
      if (this.connectedUsers.has(userId)) {
        console.log(`User ${userId} is already connected.`);
      }
  
      // Register the user as connected
      this.connectedUsers.set(userId, client);
      console.log(`User ${userId} connected, total connections: ${this.connectedUsers.size}`);
    }
  
    // When a client disconnects
    handleDisconnect(client: Socket) {
      const userId = [...this.connectedUsers.entries()].find(([key, value]) => value === client)?.[0];
      if (userId) {
        this.connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected, total connections: ${this.connectedUsers.size}`);
      }
    }
  
    // Handle new messages
    @SubscribeMessage('newMessage')
    onNewMessage(@MessageBody() body: { message: string; userId: string }): void {
      console.log(`Received message: ${body.message} from user: ${body.userId}`);
      
      // Emit the message to all connected clients
      this.server.emit('message', { message: body.message, userId: body.userId, timestamp: new Date().toISOString() });
    }
  }
  