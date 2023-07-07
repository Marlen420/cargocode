import { Body, Controller, Post, Redirect, Req, Res } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { PaymentDto } from './dto/payment.dto';
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
}
