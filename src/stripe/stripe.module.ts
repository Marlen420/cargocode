import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    UsersModule,
    OrdersModule,
  ],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
