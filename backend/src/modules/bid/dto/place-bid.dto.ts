import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class PlaceBidDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'ID of the user placing the bid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 5500.0, description: 'Bid amount — must exceed the current highest bid' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
