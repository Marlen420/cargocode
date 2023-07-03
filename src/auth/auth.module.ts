import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthController } from './auth.controler';
import { AuthService } from './auth.service';
config();

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([UserEntity, ShipperEntity, CarrierEntity]),
    RedisModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, RedisService],
  exports: [AuthService],
})
export class AuthModule {}
