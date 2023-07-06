import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from 'src/companies/companies.module';
import { MapboxModule } from 'src/mapbox/mapbox.module';
import { MapboxService } from 'src/mapbox/mapbox.service';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketModule } from 'src/socket/socket.module';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { OperatorEntity } from 'src/users/entities/operator.entity';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { OrderEntity } from './entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      UserEntity,
      ShipperEntity,
      CarrierEntity,
      OperatorEntity,
      SocketModule,
    ]),
    MapboxModule,
    UsersModule,
    RedisModule,
    CompaniesModule,
    SocketModule,
  ],
  controllers: [OrdersController],
  providers: [
    RedisService,
    OrdersService,
    MapboxService,
    UsersService,
    SocketGateway,
  ],
})
export class OrdersModule {}
