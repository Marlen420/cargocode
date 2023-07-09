import { Body, Controller, Post, Redirect, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { PaymentDto } from './dto/payment.dto';
import { PaymentLocalDto } from './dto/PaymentLocal.dto';
@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}
  @ApiBody({ type: PaymentDto })
  @Post('create-checkout-session')
  createCheckoutSession(@Body() data: PaymentDto) {
    try {
      return this.stripeService.createCheckoutSession(data);
    } catch (e) {
      return { error: e.message };
    }
  }
  @ApiOperation({ summary: 'Произвести оплату в базе данных' })
  @Post('create/payment')
  createPayment(@Body() data: PaymentLocalDto) {
    return this.stripeService.createPaymentDto(data);
  }
}
