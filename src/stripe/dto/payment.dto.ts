import { ApiProperty } from '@nestjs/swagger';

export class PaymentDto {
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
  @ApiProperty()
  success_url: string;
}
