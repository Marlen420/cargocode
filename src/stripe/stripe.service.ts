import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentDto } from './dto/payment.dto';
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

@Injectable()
export class StripeService {
  async createCheckoutSession(data: PaymentDto) {
    try {
      if (data) {
        if(data.price <= 0 ){
          data.price = 1;
        }
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${data.from} - ${data.to}`,
                  description: `${data.deliveryType}`,
                },
                unit_amount: data.price * 100,
              },
              quantity: 1,
            },
          ],
          success_url: `http://localhost:3000/orders/paid/${data.id}`, // TODO: change to success url
          cancel_url: `${data.cancel_url}`,
          locale: 'en',
        });
        return {
          url: session.url,
        };
      }
      return {
        error: 'No data provided',
      };
    } catch (e) {
      return {
        error: e.message,
      };
    }
  }
}
