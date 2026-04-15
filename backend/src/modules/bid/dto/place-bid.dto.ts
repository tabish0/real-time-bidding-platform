import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class PlaceBidDto {
  @ApiProperty({ example: 5500.0, description: 'Bid amount — must exceed the current highest bid' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
