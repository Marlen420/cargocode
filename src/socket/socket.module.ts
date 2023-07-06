import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from 'src/messages/entities/message.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity
    ]),
    UsersModule,
    MessagesModule
  ],
  providers: [
    SocketGateway,
    MessagesService
  ],
  exports: [SocketGateway],
})
export class SocketModule {}
