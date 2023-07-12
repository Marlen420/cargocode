import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from 'src/companies/companies.module';
import { MapboxModule } from 'src/mapbox/mapbox.module';
import { MapboxService } from 'src/mapbox/mapbox.service';
import { RedisModule } from 'src/redis/redis.module';
import { SocketModule } from 'src/socket/socket.module';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { OperatorEntity } from 'src/users/entities/operator.entity';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { OrderEntity } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AwsS3Module } from '../aws-s3/aws-s3.module';
import { TrimbleService } from 'src/trimble/trimble.service';
import { TrimbleModule } from 'src/trimble/trimble.module';
import { MessagesModule } from 'src/messages/messages.module';
import { MailModule } from '../mail/mail.module';
import { PaymentEntity } from '../stripe/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      UserEntity,
      ShipperEntity,
      CarrierEntity,
      OperatorEntity,
      SocketModule,
      PaymentEntity,
      CarrierEntity,
    ]),
    MapboxModule,
    UsersModule,
    RedisModule,
    CompaniesModule,
    SocketModule,
    AwsS3Module,
    TrimbleModule,
    MessagesModule,
    MailModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
