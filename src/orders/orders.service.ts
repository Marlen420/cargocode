import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { PriceEstimateDto } from './dto/priceEstimate.dto';
import { MapboxService } from 'src/mapbox/mapbox.service';
import { DistanceUnit } from 'src/mapbox/enums/distanceUnit.enum';
import CONFIG from 'src/config';
import { OrderEntity } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/createOrder.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { OrderStatus } from './enums/orderStatus.enum';
import { SocketGateway } from 'src/socket/socket.gateway';
import { S3Service } from '../aws-s3/aws-s3.service';
import { ValidationError } from 'class-validator';
import { TrimbleService } from 'src/trimble/trimble.service';

/**
 * Interface of decoded user bearer token
 */
interface UserToken {
  id: number;
  [key: string]: any;
}

/**
 * Service that response for orders
 */
@Injectable()
export class OrdersService {
  /**
   * Constructs order service
   * @param {Redis} redisService redis service
   * @param jwtService jwt service
   * @param mapboxService mapbox service
   * @param usersService users servuce
   * @param socketGateway
   * @param orderRepo order entity repository
   * @param s3Service
   */
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly mapboxService: MapboxService,
    private readonly trimbleService: TrimbleService,
    private readonly usersService: UsersService,
    private readonly socketGateway: SocketGateway,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private s3Service: S3Service,
  ) {}

  /**
   * Estimates price of shipping
   * @param {PriceEstimateDto} data details of shipping
   * @returns {Promise<number>} price of shipping
   */
  async priceEstimate(data: PriceEstimateDto) {
    const distance = await this.mapboxService.getDistance(
      data.pickup_location,
      data.destination,
      DistanceUnit.mi,
    );
    let price = distance * CONFIG.priceSystem.baseRatePerMile;
    price += +data.weight * CONFIG.priceSystem.weightFactorPerPound;
    return price;
  }

  /**
   * Creates new order
   * @param {Request} req request to get token
   * @param {CreateOrderDto} data order details
   * @returns {Promise<OrderEntity>} result of saving order
   */
  async createOrder(req: Request, data: CreateOrderDto): Promise<any> {
    const token = this.getDecodedToken(req);
    const shipper: ShipperEntity = await this.usersService.findOneShipper(
      token.id,
    );
    if (!shipper) {
      throw new BadRequestException("Shipper doesn't exist");
    }
    const order: OrderEntity = new OrderEntity();
    order.shipper = shipper;
    order.status = OrderStatus.waiting;
    const location = await this.trimbleService.getLocation(
      data.pickup_location,
      data.destination,
    );
    const { Lat: originLat, Lon: originLon } =
      location.start.Locations[0].Coords;
    const { Lat: destinationLat, Lon: destinationLon } =
      location.end.Locations[0].Coords;
    order.origin_latitude = originLat;
    order.origin_longitude = originLon;
    order.destination_latitude = destinationLat;
    order.destination_longitude = destinationLon;
    Object.assign(order, data);
    const savedOrder = await this.orderRepo.save(order);
    await this.socketGateway.sendOrder(savedOrder);
    return savedOrder;
  }

  /**
   * Accepts created order by carrier
   * @param {Request} req request
   * @param {number} orderId id of order to accept
   * @returns {Promise<OrderEntity>} accepted order
   */
  async acceptOrder(req: Request, orderId: number): Promise<any> {
    const token = this.getDecodedToken(req);
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestException("Order doesn't exist");
    }
    const carrier: CarrierEntity = await this.usersService.findOneCarrier(
      token.id,
      { user: false },
    );
    console.log(carrier);
    if (!carrier) {
      throw new BadRequestException("Couldn't accept the order");
    }
    if (order.status !== OrderStatus.waiting) {
      throw new BadRequestException('Order already accepted');
    }
    order.status = OrderStatus.accepted;
    order.carrier = carrier;
    return this.orderRepo.save(order);
  }

  /**
   * Starts shipping accepted order
   * @param req request to get token
   * @param id id of order to start shipping
   * @returns {Promise<Order>} promise to return updated order
   */
  async startShipping(req: Request, id: number): Promise<OrderEntity> {
    const token = this.getDecodedToken(req);
    let order: OrderEntity = await this.redisService.get(
      `orders:ordersService:order:${id}`,
    );
    if (order?.carrier.id !== token.id) {
      throw new BadRequestException('Forbidden resource');
    }
    if (!order) {
      order = await this.orderRepo.findOne({ where: { id } });
      if (!order) {
        throw new BadRequestException("Order doesn't exist");
      }
    }
    if (order.status !== OrderStatus.accepted) {
      throw new BadRequestException('Order is not accepted');
    }
    order.status = OrderStatus.on_way;
    return this.orderRepo.save(order).then(async (savedOrder) => {
      await this.redisService.set(
        `orders:ordersService:order:${id}`,
        savedOrder,
      );
      return savedOrder;
    });
  }

  /**
   * Finishes shipping accepted order
   * @param req request to get token
   * @param id id of order to finish
   * @returns {Promise<Order>} promise to return updated order
   */
  async finishShipping(req: Request, id: number): Promise<OrderEntity> {
    const token = this.getDecodedToken(req);
    let order: OrderEntity = await this.redisService.get(
      `orders:ordersService:order:${id}`,
    );
    if (order?.carrier.id !== token.id) {
      throw new BadRequestException('Forbidden resource');
    }
    if (!order) {
      order = await this.orderRepo.findOne({ where: { id } });
      if (!order) {
        throw new BadRequestException("Order doesn't exist");
      }
    }
    if (order.status !== OrderStatus.on_way) {
      throw new BadRequestException('Order is not on way');
    }
    order.status = OrderStatus.finished;
    return this.orderRepo.save(order).then(async (savedOrder) => {
      await this.redisService.set(
        `orders:ordersService:order:${id}`,
        savedOrder,
      );
      return savedOrder;
    });
  }

  /**
   * Disables order by provided id
   * @param id id of order to disable
   * @returns {Promise<OrderEntity>} promise to return order
   */
  async disableOrder(req: Request, id: number) {
    const token = this.getDecodedToken(req);
    let order: OrderEntity = await this.redisService.get(
      `orders:ordersService:order:${id}`,
    );
    if (order?.shipper.id !== token.id) {
      throw new ForbiddenException('Forbidden resource');
    }
    if (!order) {
      order = await this.orderRepo.findOne({
        where: { shipper: token.shipper, id },
      });
      if (!order) {
        throw new BadRequestException("Order doesn't exist");
      }
    }
    if (order.status !== OrderStatus.waiting) {
      throw new BadGatewayException(
        "Cannot disable order, it's already accepted",
      );
    }
    order.active = false;
    return this.orderRepo.save(order).then(async (savedOrder) => {
      await this.redisService.set(
        `orders:ordersService:order:${id}`,
        savedOrder,
      );
      return savedOrder;
    });
  }
  async uploadAcceptanceImage(id: number, file: Express.Multer.File) {
    const registeredOrder = await this.orderRepo.findOne({
      where: { id },
    });
    if (!registeredOrder) {
      throw new BadRequestException("Order doesn't exist");
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const bucketKey = `${file.fieldname}${Date.now()}`;
    const fileUrl = await this.s3Service.uploadFile(file, bucketKey);
    return this.orderRepo.update({ id }, { acceptance_image: fileUrl });
  }
  /**
   * Enables order by provided id
   * @param id id of order to disable
   * @returns {Promise<OrderEntity>} promise to return order
   */
  async enableOrder(req: Request, id: number) {
    const token = this.getDecodedToken(req);
    let order: OrderEntity = await this.redisService.get(
      `orders:ordersService:order:${id}`,
    );
    if (order?.shipper.id !== token.id) {
      throw new ForbiddenException('Forbidden resource');
    }
    if (!order) {
      order = await this.orderRepo.findOne({
        where: { shipper: token.shipper, id },
      });
      if (!order) {
        throw new BadRequestException("Order doesn't exist");
      }
    }
    if (order.status !== OrderStatus.waiting) {
      throw new BadGatewayException(
        "Cannot enable order, it's already accepted",
      );
    }
    order.active = true;
    return this.orderRepo.save(order).then(async (savedOrder) => {
      await this.redisService.set(
        `orders:ordersService:order:${id}`,
        savedOrder,
      );
      return savedOrder;
    });
  }

  /**
   * Returns array of orders
   * @returns {Promise<OrderEntity[]>} array of orders
   */
  async getOrders(): Promise<OrderEntity[]> {
    const orders = await this.orderRepo.find({
      relations: {
        shipper: {
          user: true,
        },
        carrier: true,
      },
    });

    return orders;
  }

  /**
   * Returns order by provided id
   * @param id id of order to get
   * @returns {Promise<OrderEntity>} order
   */
  async getOrderById(id: number): Promise<OrderEntity> {
    const order: OrderEntity = await this.redisService.get(
      `orders:ordersService:order:${id}`,
    );
    if (order) {
      return order;
    }
    return this.orderRepo.findOne({ where: { id } });
  }

  /**
   * Returns orders of user
   * @param {Request} req request to get token from headers
   * @param {RolesEnum} role role of user
   * @returns {Promise<OrderEntity[]>} promsie to return array of user orders
   */
  async getMyOrders(req: Request): Promise<OrderEntity[]> {
    const token = this.getDecodedToken(req);
    if (token.role === RolesEnum.CARRIER) {
      const carrier = await this.usersService.findOneCarrier(token.id, {
        user: false,
      });
      if (!carrier) {
        throw new BadRequestException("Carrier doesn't exist");
      }
      return this.orderRepo.find({ where: { carrier: { id: carrier.id } } });
    }
    const shipper = await this.usersService.findOneShipper(token.id, {
      user: false,
    });
    return this.orderRepo.find({ where: { shipper: { id: shipper.id } } });
  }

  async sendMessage(message: any) {
    console.log('Service');
    return await this.socketGateway.sendOrder(message);
  }

  private getDecodedToken(req: Request): UserToken {
    return this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ) as UserToken;
  }
}
