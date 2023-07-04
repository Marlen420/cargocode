import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { CompaniesModule } from 'src/companies/companies.module';
import { CompaniesService } from 'src/companies/companies.service';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { OperatorEntity } from 'src/users/entities/operator.entity';
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
    TypeOrmModule.forFeature([UserEntity, ShipperEntity, CarrierEntity, OperatorEntity, CompanyEntity]),
    RedisModule,
    CompaniesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, RedisService, CompaniesService],
  exports: [AuthService],
})
export class AuthModule {}
