import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateAuctionDto {
  @ApiProperty({ example: 'Vintage Rolex Submariner 1968', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Original dial, crown and bezel intact...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 4500.0, description: 'Starting price in USD' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  startingPrice: number;

  @ApiProperty({ example: 48, description: 'Auction duration in hours (1–8760)', minimum: 1, maximum: 8760 })
  @IsInt()
  @Min(1)
  @Max(8760) // 1 year ceiling
  durationHours: number;
}
