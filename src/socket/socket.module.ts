import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from 'src/messages/entities/message.entity';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { SocketGateway } from './socket.gateway';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
    UsersModule,
    MessagesModule,
    RedisModule
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
