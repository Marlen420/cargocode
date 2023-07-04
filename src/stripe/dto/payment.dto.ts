import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty()
  from: string;
  @ApiProperty()
  to: string;
  @ApiProperty()
  distance: string;
  @ApiProperty()
  deliveryType: string;
  @ApiProperty()
  price: number;
}
