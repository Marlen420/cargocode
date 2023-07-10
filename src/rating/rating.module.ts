import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingEntity } from './entities/rating.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RatingEntity]),
    JwtModule,
    UsersModule,
    OrdersModule,
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
