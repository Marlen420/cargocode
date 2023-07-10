import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from 'src/companies/companies.module';
import { RedisModule } from 'src/redis/redis.module';
import { RedisService } from 'src/redis/redis.service';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { OperatorEntity } from 'src/users/entities/operator.entity';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { MessageEntity } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MailModule } from '../mail/mail.module';
import { MessagesController } from './messages.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      UserEntity,
      ShipperEntity,
      CarrierEntity,
      OperatorEntity,
    ]),
    CompaniesModule,
    UsersModule,
    RedisModule,
    MailModule,
  ],
  providers: [MessagesService, UsersService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
