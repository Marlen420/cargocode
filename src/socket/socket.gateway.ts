import { Body, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from 'src/messages/messages.service';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { RedisService } from 'src/redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class SocketGateway {
  @WebSocketServer()
  private server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly redisService: RedisService
  ) {}

  async handleConnection(client: Socket) {}

  async handleDisconnect(client: Socket) {}

  async sendOrder(order: OrderEntity) {
    this.server.emit('orders:create-order', order);
  }

  @SubscribeMessage('orders:get-room-messages')
  async getRoomMessages(client, { orderId }) {
    const messages = await this.messagesService.findMessageByRoom(orderId);
    this.server
      .to(client.id)
      .emit('orders:receive-room-messages', { data: messages, orderId });
  }

  @SubscribeMessage('orders:send-message')
  async sendMessage(client, data: SendMessageDto) {
    const message = await this.messagesService.createMessage({
      orderId: data.orderId,
      authorId: data.authorId,
      text: data.text,
    });
    this.server.to(client.id).emit('orders:receive-message', message);
  }

  @SubscribeMessage('orders:navigation')
  async navigateLocation(client, data) {
    await this.redisService.set(`orders:navigation:${data.orderId}`, data);
    await this.server.emit(`orders:navigation:${data.orderId}`, data);
  }
}
