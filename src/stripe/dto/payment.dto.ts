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
  @ApiProperty({
    example: 'https://pornhub.com',
  })
  cancel_url: string;
  @ApiProperty({
    example: 'https://pornhub.com',
  })
  success_url: string;
}
