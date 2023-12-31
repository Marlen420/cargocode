import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ShipperEntity } from './entities/shipper.entity';
import { CarrierEntity } from './entities/carrier.entity';
import { RedisModule } from 'src/redis/redis.module';
import { CompaniesService } from 'src/companies/companies.service';
import { CompaniesModule } from 'src/companies/companies.module';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { OperatorEntity } from './entities/operator.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { MessageEntity } from 'src/messages/entities/message.entity';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
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
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
