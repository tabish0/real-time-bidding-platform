import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class BidGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(BidGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Frontend joins this room to receive real-time bid events for a specific auction.
   * Emit: socket.emit('join-auction', '<auctionId>')
   */
  @SubscribeMessage('join-auction')
  handleJoinAuction(client: Socket, auctionId: string): void {
    client.join(`auction:${auctionId}`);
    this.logger.log(`Client ${client.id} joined auction room: ${auctionId}`);
  }

  @SubscribeMessage('leave-auction')
  handleLeaveAuction(client: Socket, auctionId: string): void {
    client.leave(`auction:${auctionId}`);
  }

  /**
   * Broadcast a new bid to all clients watching this auction.
   * Called by BidService immediately after a bid is persisted.
   */
  emitBidPlaced(
    auctionId: string,
    payload: { id: string; userId: string; userName: string; amount: number; createdAt: Date },
  ): void {
    this.server.to(`auction:${auctionId}`).emit('bid-placed', payload);
  }
}
