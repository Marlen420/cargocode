import { CarrierEntity } from '../../users/entities/carrier.entity';
import { ShipperEntity } from '../../users/entities/shipper.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';
import { OrderEntity } from '../../orders/entities/order.entity';

export class CreateRatingDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
  @ApiProperty()
  comment: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  orderId: number;
  order: OrderEntity;
  shipper: ShipperEntity;
  carrier: CarrierEntity;
}
