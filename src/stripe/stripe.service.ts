import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentDto } from './dto/payment.dto';
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

@Injectable()
export class StripeService {
  async createCheckoutSession(data: PaymentDto[]) {
    try {
      if (data && data.length > 0) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: data.map((item) => {
            return {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${item.from} - ${item.to} -> ${item.distance}`,
                  description: `${item.deliveryType}`,
                },
                unit_amount: item.price * 100,
              },
              quantity: 1,
            };
          }),
          success_url: `https://www.google.com/success`, // TODO: change to success url
          cancel_url: `https://www.google.com/cancel`,
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
