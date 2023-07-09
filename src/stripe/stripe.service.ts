import { BadRequestException, Injectable } from '@nestjs/common';
import { PaymentDto } from './dto/payment.dto';
import { PaymentLocalDto } from './dto/PaymentLocal.dto';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

@Injectable()
export class StripeService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,

    private usersService: UsersService,
    private ordersService: OrdersService,
  ) {}
  async createCheckoutSession(data: PaymentDto) {
    try {
      if (data) {
        if (data.price <= 0) {
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
          success_url: `${data.success_url}`,
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
  async createPaymentDto(data: PaymentLocalDto) {
    const carrier = await this.usersService.findOne(data.carrierId);
    const orderId = await this.ordersService.findOne(data.orderId);
    return await this;
  }
}
