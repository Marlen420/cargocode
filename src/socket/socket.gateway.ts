import { Body, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { OrderEntity } from 'src/orders/entities/order.entity';

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
})
export class SocketGateway {
    @WebSocketServer()
    private server: Server;

    constructor() {
    }

    async handleConnection(client: Socket) {
        // console.log('Client connected: ', client.id);
    }

    async handleDisconnect(client: Socket) {
        // console.log('Client disconnected: ', client.id);
    }

    async sendOrder(order: OrderEntity) {
        this.server.emit('orders:create-order', order);
    }
}