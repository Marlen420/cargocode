import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { CreateOrderDto } from './dto/createOrder.dto';
import { PriceEstimateDto } from './dto/priceEstimate.dto';
import { OrderEntity } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Orders')
@ApiBearerAuth()
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

  // @Roles(RolesEnum.COMPANY, RolesEnum.OPERATOR, RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
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
  @Put('accept-order/:orderId')
  async acceptOrder(@Req() req: Request, @Param('orderId') orderId: number) {
    return this.ordersService.acceptOrder(req, orderId);
  }

  @Roles(RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Start shipping accepted order' })
  @Put('start-shipping/:orderId')
  async startShipping(@Req() req: Request, @Param('orderId') orderId: number) {
    return this.ordersService.startShipping(req, orderId);
  }
  @Roles(RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Start shipping accepted order' })
  @Put('delivered-shipping/:orderId')
  async deliveredShipping(
    @Req() req: Request,
    @Param('orderId') orderId: number,
  ) {
    return this.ordersService.deliveredShipping(req, orderId);
  }

  @Roles(RolesEnum.CARRIER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Finish shipping accepted order' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Put('finish-shipping/:orderId')
  async finishShipping(
    @Req() req: Request,
    @Param('orderId') orderId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ordersService.finishShipping(req, orderId, file);
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
}
