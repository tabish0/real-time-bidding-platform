import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Bid } from './entities/bid.entity';

@ApiTags('Bids')
@Controller('auctions/:auctionId/bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bid on an auction (requires auth)' })
  @ApiParam({ name: 'auctionId', type: 'string', format: 'uuid' })
  @ApiCreatedResponse({ description: 'Bid placed successfully', type: Bid })
  placeBid(
    @Param('auctionId', ParseUUIDPipe) auctionId: string,
    @Body() dto: PlaceBidDto,
    @Req() req: Request,
  ): Promise<Bid> {
    const { id: userId } = req.user as AuthenticatedUser;
    return this.bidService.placeBid(auctionId, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get bid history for an auction' })
  @ApiParam({ name: 'auctionId', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Bids ordered newest first', type: Bid, isArray: true })
  findByAuction(
    @Param('auctionId', ParseUUIDPipe) auctionId: string,
  ): Promise<Bid[]> {
    return this.bidService.findByAuction(auctionId);
  }
}
