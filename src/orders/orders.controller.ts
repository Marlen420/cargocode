import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { CreateOrderDto } from './dto/createOrder.dto';
import { PriceEstimateDto } from './dto/priceEstimate.dto';
import { OrderEntity } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(RolesEnum.SHIPPER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get estimated price for shipping' })
  @Get('price-estimate')
  @ApiQuery({ name: 'required_equipment', type: 'string', required: false })
  @ApiQuery({ name: 'special_instructions', type: 'string', required: false })
  async priceEstimate(@Query() data: PriceEstimateDto): Promise<any> {
    return this.ordersService.priceEstimate(data);
  }

  //   @Roles(RolesEnum.COMPANY, RolesEnum.OPERATOR, RolesEnum.CARRIER)
  //   @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all orders' })
  @Get()
  async getOrders(): Promise<OrderEntity[]> {
    return this.ordersService.getOrders();
  }

  @Roles(RolesEnum.SHIPPER, RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get my orders' })
  @Get('my-orders')
  async getMyOrders(@Req() req: Request) {
    return this.ordersService.getMyOrders(req);
  }

  @Roles('ALL')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get order by id' })
  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<OrderEntity> {
    return this.ordersService.getOrderById(+id);
  }

  @Roles(RolesEnum.SHIPPER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new order' })
  @Post('create-order')
  async createOrder(@Req() req: Request, @Body() data: CreateOrderDto) {
    return this.ordersService.createOrder(req, data);
  }

  @Roles(RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Accept order' })
  @Post('accept-order')
  async acceptOrder(@Req() req: Request, @Body('orderId') orderId: number) {
    return this.ordersService.acceptOrder(req, orderId);
  }

  @Roles(RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Start shipping accepted order' })
  @Post('start-shipping')
  async startShipping(@Req() req: Request, @Body('orderId') orderId: number) {
    return this.ordersService.startShipping(req, orderId);
  }

  @Roles(RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Finish shipping accepted order' })
  @Post('finish-shipping')
  async finishShipping(@Req() req: Request, @Body('orderId') orderId: number) {
    return this.ordersService.finishShipping(req, orderId);
  }

  @Roles(RolesEnum.SHIPPER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Enables order' })
  @Patch('enalbe-order/:id')
  async enableOrder(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<OrderEntity> {
    return this.ordersService.enableOrder(req, +id);
  }

  @Roles(RolesEnum.SHIPPER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Disables order' })
  @Patch('disable-order/:id')
  async disableOrder(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<OrderEntity> {
    return this.ordersService.disableOrder(req, +id);
  }

  @ApiOperation({ summary: 'Send message to client through web socket' })
  @ApiBody({})
  @Post('send-message')
  async sendMessage(@Body() data: any) {
    return this.ordersService.sendMessage(data);
  }
}
