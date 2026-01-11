import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
@Injectable()
export class WebsocketService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.clients.set(userId, client);
      console.log(`Client connected: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socket] of this.clients.entries()) {
      if (socket.id === client.id) {
        this.clients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
        break;
      }
    }
  }

  envoyerNotification(channel: string, data: any): void {
    this.server.emit(channel, data);
  }

  envoyerNotificationParUserId(userId: string, channel: string, data: any): void {
    const client = this.clients.get(userId);
    if (client) {
      client.emit(channel, data);
    }
  }
}