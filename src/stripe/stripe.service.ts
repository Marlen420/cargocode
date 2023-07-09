import { Injectable } from '@nestjs/common';
import { PaymentDto } from './dto/payment.dto';
import { PaymentLocalDto } from './dto/PaymentLocal.dto';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { CarrierEntity } from '../users/entities/carrier.entity';
import { ShipperEntity } from '../users/entities/shipper.entity';
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
/**
 * Service responsible for handling Stripe payments
 */
@Injectable()
export class StripeService {
  /**
   * Constructs Stripe service
   * @param {Repository<PaymentEntity>} paymentRepo Payment entity repository
   * @param {UsersService} usersService Users service
   * @param {OrdersService} ordersService Orders service
   */
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    private usersService: UsersService,
    private ordersService: OrdersService,
  ) {}

  /**
   * Creates a checkout session for Stripe payment
   * @param {PaymentDto} data Payment details
   * @returns {Promise<any>} Promise containing the URL for the checkout session
   */
  async createCheckoutSession(data: PaymentDto): Promise<any> {
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

  /**
   * Creates a payment entity for a local payment
   * @param {PaymentLocalDto} data Payment details
   * @returns {Promise<PaymentEntity>} Promise containing the created payment entity
   */
  async createPaymentDto(data: PaymentLocalDto): Promise<PaymentEntity> {
    const shipper: ShipperEntity = await this.usersService.findShipperById(
      data.carrierId,
    );
    const order = await this.ordersService.findOne(data.orderId);
    const payment = new PaymentEntity();
    payment.shipper = shipper;
    payment.order = order;
    payment.date = new Date();
    await this.ordersService.orderToWaitStatusById(data.orderId);
    return await this.paymentRepo.save(payment);
  }
}
