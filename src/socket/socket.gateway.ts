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
    private readonly messagesService: MessagesService
  ) {}

  async handleConnection(client: Socket) {
    // console.log('Client connected: ', client.id);
  }

  async handleDisconnect(client: Socket) {
    // console.log('Client disconnected: ', client.id);
  }

  async sendOrder(order: OrderEntity) {
    this.server.emit('orders:create-order', order);
  }

  @SubscribeMessage('orders:get-room-messages')
  async getRoomMessages(client, {userId, orderId}) {
    const messages = await this.messagesService.findMessageByRoom(orderId);
    console.log('Client ID: ', client.id);
    this.server.to(client.id).emit('orders:receive-room-messages', {data: messages, orderId});
  }

  @SubscribeMessage('orders:send-message')
  async sendMessage(data: SendMessageDto) {
    const message = await this.messagesService.createMessage({orderId: data.orderId, authorId: data.authorId, text: data.text});
    this.server.to(data.orderId.toString()).emit('orders:receive-message', {data: message});
  }
}
