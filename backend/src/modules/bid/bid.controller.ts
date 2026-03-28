import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Bid } from './entities/bid.entity';

@ApiTags('Bids')
@Controller('auctions/:auctionId/bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @ApiOperation({ summary: 'Place a bid on an auction' })
  @ApiParam({ name: 'auctionId', type: 'string', format: 'uuid' })
  @ApiCreatedResponse({ description: 'Bid placed successfully', type: Bid })
  placeBid(
    @Param('auctionId', ParseUUIDPipe) auctionId: string,
    @Body() dto: PlaceBidDto,
  ): Promise<Bid> {
    return this.bidService.placeBid(auctionId, dto);
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
