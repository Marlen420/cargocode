import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  from: string;
  @ApiProperty()
  to: string;
  @ApiProperty()
  deliveryType: string;
  @ApiProperty()
  price: number;
  @ApiProperty()
  cancel_url: string;
}
