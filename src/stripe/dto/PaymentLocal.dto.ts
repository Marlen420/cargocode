import { ApiProperty } from '@nestjs/swagger';

export class PaymentLocalDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  orderId: number;
  @ApiProperty()
  carrierId: number;
  @ApiProperty()
  shipperId: number;
}
