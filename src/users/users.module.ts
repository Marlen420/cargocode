import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ShipperEntity } from './entities/shipper.entity';
import { CarrierEntity } from './entities/carrier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ShipperEntity, CarrierEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
