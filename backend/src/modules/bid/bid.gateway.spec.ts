import { Test, TestingModule } from '@nestjs/testing';
import { BidGateway } from './bid.gateway';

const mockSocket = () =>
  ({
    id: 'socket-1',
    join: jest.fn(),
    leave: jest.fn(),
  }) as any;

describe('BidGateway', () => {
  let gateway: BidGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BidGateway],
    }).compile();

    gateway = module.get<BidGateway>(BidGateway);
  });

  describe('handleConnection', () => {
    it('logs a connection message without throwing', () => {
      const client = mockSocket();
      expect(() => gateway.handleConnection(client)).not.toThrow();
    });
  });

  describe('handleDisconnect', () => {
    it('logs a disconnection message without throwing', () => {
      const client = mockSocket();
      expect(() => gateway.handleDisconnect(client)).not.toThrow();
    });
  });

  describe('handleJoinAuction', () => {
    it('makes the client join the correct room', () => {
      const client = mockSocket();
      gateway.handleJoinAuction(client, 'auction-1');
      expect(client.join).toHaveBeenCalledWith('auction:auction-1');
    });
  });

  describe('handleLeaveAuction', () => {
    it('makes the client leave the correct room', () => {
      const client = mockSocket();
      gateway.handleLeaveAuction(client, 'auction-1');
      expect(client.leave).toHaveBeenCalledWith('auction:auction-1');
    });
  });

  describe('emitBidPlaced', () => {
    it('emits bid-placed event to the auction room', () => {
      const mockEmit = jest.fn();
      const mockTo = jest.fn().mockReturnValue({ emit: mockEmit });
      // Inject a mock server
      (gateway as any).server = { to: mockTo };

      const payload = {
        id: 'bid-1',
        userId: 'user-1',
        userName: 'User 1',
        amount: 150,
        createdAt: new Date(),
      };

      gateway.emitBidPlaced('auction-1', payload);

      expect(mockTo).toHaveBeenCalledWith('auction:auction-1');
      expect(mockEmit).toHaveBeenCalledWith('bid-placed', payload);
    });
  });
});
