import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { RolesEnum } from "src/users/enums/roles.enum";
import { CreateOrderDto } from "./dto/createOrder.dto";
import { PriceEstimateDto } from "./dto/priceEstimate.dto";
import { OrderEntity } from "./entities/order.entity";
import { OrdersService } from "./orders.service";

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService
    ) {}

    @ApiOperation({summary: 'Get estimated price for shipping'})
    @Get('price-estimate')
    @ApiQuery({name: 'required_equipment', type: 'string', required: false})
    @ApiQuery({name: 'special_instructions', type: 'string', required: false})
    async priceEstimate(@Query() data: PriceEstimateDto): Promise<any> {
        return this.ordersService.priceEstimate(data);
    }

    @ApiOperation({summary: 'Get all orders'})
    @Get()
    async getOrders(): Promise<OrderEntity[]> {
        return this.ordersService.getOrders();
    }

    @ApiOperation({summary: 'Get my orders'})
    @Get('my-orders')
    async getMyOrders(@Req() req: Request) {
        return this.ordersService.getMyOrders(req);
    }

    @ApiOperation({summary: 'Get order by id'})
    @Get(':id')
    async getOrderById(@Param('id') id: string): Promise<OrderEntity> {
        return this.ordersService.getOrderById(+id);
    }

    @ApiOperation({summary: 'Create a new order'})
    @Post('create-order')
    async createOrder(@Req() req: Request, @Body() data: CreateOrderDto) {
        return this.ordersService.createOrder(req, data);
    }

    @ApiOperation({summary: 'Accept order'})
    @Post('accept-order')
    async acceptOrder(@Req() req: Request, @Body('orderId') orderId: number) {
        return this.ordersService.acceptOrder(req, orderId);
    }

    @ApiOperation({summary: 'Start shipping accepted order'})
    @Post('start-shipping')
    async startShipping(@Req() req: Request, @Body('orderId') orderId: number) {
        return this.ordersService.startShipping(req, orderId);
    }

    @ApiOperation({summary: 'Finish shipping accepted order'})
    @Post('finish-shipping')
    async finishShipping(@Req() req: Request, @Body('orderId') orderId: number) {
        return this.ordersService.finishShipping(req, orderId);
    }

    @ApiOperation({summary: 'Disables order'})
    @Patch('enalbe-order/:id')
    async enableOrder(@Req() req: Request, @Param('id') id: string): Promise<OrderEntity> {
        return this.ordersService.enableOrder(req, +id);
    }

    @ApiOperation({summary: 'Disables order'})
    @Patch('disable-order/:id')
    async disableOrder(@Req() req: Request, @Param('id') id: string): Promise<OrderEntity> {
        return this.ordersService.disableOrder(req, +id);
    }
}