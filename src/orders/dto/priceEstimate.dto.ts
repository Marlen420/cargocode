import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsString } from 'class-validator';

export class PriceEstimateDto {
  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  pickup_location: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  destination: string;

  @ApiProperty()
  @IsDateString()
  pickup_date: Date;

  @ApiProperty()
  @IsDateString()
  delivery_date: Date;

  @ApiProperty({ example: 88000 })
  @IsString()
  weight: string;

  @ApiProperty({ example: 'Metal' })
  @IsString()
  type: string;

  @ApiProperty({ nullable: true })
  required_equipment: string | null;

  @ApiProperty({ nullable: true })
  special_instructions: string | null | undefined;
}
