import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { CompaniesModule } from 'src/companies/companies.module';
import { CompaniesService } from 'src/companies/companies.service';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { RedisModule } from 'src/redis/redis.module';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { OperatorEntity } from 'src/users/entities/operator.entity';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controler';
import { AuthService } from './auth.service';
import { MailModule } from '../mail/mail.module';
config();

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      UserEntity,
      ShipperEntity,
      CarrierEntity,
      OperatorEntity,
      CompanyEntity,
    ]),
    RedisModule,
    CompaniesModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
