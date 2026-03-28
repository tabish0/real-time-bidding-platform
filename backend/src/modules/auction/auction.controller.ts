import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuctionService, PaginatedResult } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionsQueryDto } from './dto/get-auctions-query.dto';
import { Auction } from './entities/auction.entity';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new auction item' })
  @ApiCreatedResponse({ description: 'Auction created', type: Auction })
  create(@Body() dto: CreateAuctionDto): Promise<Auction> {
    return this.auctionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all auctions with optional status filter and pagination' })
  @ApiOkResponse({ description: 'Paginated list of auctions', type: Auction, isArray: true })
  findAll(@Query() query: GetAuctionsQueryDto): Promise<PaginatedResult<Auction>> {
    return this.auctionService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single auction by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Auction detail', type: Auction })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Auction> {
    return this.auctionService.findOne(id);
  }
}
