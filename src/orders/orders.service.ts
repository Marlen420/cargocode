import {
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
import { In, Repository } from 'typeorm';
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
import { TrimbleService } from 'src/trimble/trimble.service';
import { MailService } from '../mail/mail.service';
import { PaymentEntity } from '../stripe/entities/payment.entity';

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
   * @param trimbleService
   * @param usersService users servuce
   * @param socketGateway
   * @param orderRepo order entity repository
   * @param paymentRepo
   * @param carrierRepo
   * @param s3Service
   * @param mailService
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
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(CarrierEntity)
    private readonly carrierRepo: Repository<CarrierEntity>,
    private s3Service: S3Service,
    private readonly mailService: MailService,
  ) {}

  /**
   * Estimates price of shipping
   * @param {PriceEstimateDto} data details of shipping
   * @returns {Promise<number>} price of shipping
   */
  async priceEstimate(data: PriceEstimateDto): Promise<number> {
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
    order.status = OrderStatus.not_paid;
    const location = await this.trimbleService.getLocation(
      data.pickup_location,
      data.destination,
    );
    const { Lat: originLat, Lon: originLon } =
      location.start.Locations[0].Coords;
    const { Lat: destinationLat, Lon: destinationLon } =
      location.end.Locations[0].Coords;
    order.pickup_latitude = originLat;
    order.pickup_longitude = originLon;
    order.destination_latitude = destinationLat;
    order.destination_longitude = destinationLon;
    order.price = await this.priceEstimate({
      pickup_location: data.pickup_location,
      destination: data.destination,
      pickup_date: data.pickup_date,
      delivery_date: data.delivery_date,
      weight: data.weight,
      type: data.type,
      required_equipment: data.required_equipment,
      special_instructions: data.special_instructions,
    });
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
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: {
        shipper: {
          user: true,
        },
      },
    });
    if (!order) {
      throw new BadRequestException("Order doesn't exist");
    }
    const carrier: CarrierEntity = await this.usersService.findOneCarrier(
      token.id,
      { user: false },
    );
    if (!carrier) {
      throw new BadRequestException("Couldn't accept the order");
    }
    if (order.status !== OrderStatus.waiting) {
      throw new BadRequestException('Order already accepted');
    }
    order.status = OrderStatus.accepted;
    order.carrier = carrier;
    await this.mailService.sendMail(
      `${carrier.user.email}`,
      'Your accepted order',
      `<h1>Order accepted</h1>
            <p><strong>Order id:</strong> ${order.id}</p>
            <p><strong>Shipper:</strong> ${order.shipper.user.firstname} ${order.shipper.user.lastname}</p>
            <p><strong>Carrier:</strong> ${carrier.user.firstname} ${carrier.user.lastname}</p>
            <p><strong>Phone:</strong> ${carrier.user.phone}</p>
            <p><strong>Email:</strong> ${carrier.user.email}</p>
            <p><strong>Price:</strong> ${order.price}</p>
            <p><strong>Weight:</strong> ${order.weight}</p>
            <p><strong>Origin:</strong> ${order.pickup_location}</p>
            <p><strong>Destination:</strong> ${order.destination}</p>
            <p><strong>Origin latitude:</strong> ${order.pickup_latitude}</p>
            <p><strong>Origin longitude:</strong> ${order.pickup_longitude}</p>
            <p><strong>Destination latitude:</strong> ${order.destination_latitude}</p>
            <p><strong>Destination longitude:</strong> ${order.destination_longitude}</p>
       `,
    );
    return this.orderRepo.save(order);
  }
  async orderToWaitStatusById(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    order.status = OrderStatus.waiting;
    return await this.orderRepo.save(order);
  }
  async deliveredShipping(req: Request, id: number) {
    const token = this.getDecodedToken(req);
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        carrier: {
          user: true,
        },
        shipper: {
          user: true,
        },
      },
    });
    if (!order) {
      throw new BadRequestException("Order doesn't exist");
    }
    if (order?.carrier.user.id !== token.id) {
      throw new BadRequestException('Forbidden resource');
    }
    if (order.status !== OrderStatus.on_way) {
      throw new BadRequestException('Order is not accepted');
    }
    order.status = OrderStatus.delivered;
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
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        carrier: {
          user: true,
        },
        shipper: {
          user: true,
        },
      },
    });
    if (!order) {
      throw new BadRequestException("Order doesn't exist");
    }
    if (order?.carrier.user.id !== token.id) {
      throw new BadRequestException('Forbidden resource');
    }
    if (order.status !== OrderStatus.accepted) {
      throw new BadRequestException('Order is not accepted');
    }
    order.status = OrderStatus.on_way;
    return this.orderRepo.save(order);
  }

  /**
   * Finishes shipping accepted order
   * @param req request to get token
   * @param id id of order to finish
   * @param file
   * @returns {Promise<Order>} promise to return updated order
   */
  async finishShipping(
    req: Request,
    id: number,
    file: Express.Multer.File,
  ): Promise<OrderEntity> {
    const token = this.getDecodedToken(req);
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: {
        carrier: {
          user: true,
        },
      },
    });
    if (order?.carrier.user.id !== token.id) {
      throw new BadRequestException('Forbidden resource');
    }
    if (order.status !== OrderStatus.delivered) {
      throw new BadRequestException('Order is not delivered');
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    const bucketKey = `${file.fieldname}${Date.now()}`;
    const fileUrl = await this.s3Service.uploadFile(file, bucketKey);
    order.status = OrderStatus.finished;
    order.acceptance_image = fileUrl;
    const payment = await this.paymentRepo.findOne({
      where: { order: { id: order.id } },
    });
    payment.carrier = await this.carrierRepo.findOne({
      where: { id: order.carrier.id },
    });
    await this.paymentRepo.save(payment);
    return this.orderRepo.save(order);
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
      throw new BadRequestException(
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
      throw new BadRequestException(
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
  async findOne(id: number) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new BadRequestException('Order is not found');
    }
    return order;
  }

  /**
   * Returns array of orders
   * @returns {Promise<OrderEntity[]>} array of orders
   */
  async getOrders(status?: OrderStatus): Promise<OrderEntity[]> {
    const query = {
      relations: {
        shipper: {
          user: true,
        },
        carrier: {
          user: true,
        },
      },
    };
    if (status) {
      query['where'] = {status};
    }
    let orders;
    // let redisKey = 'orders:ordersService:status';
    // if (Array.isArray(status)) {
    //   status.map((item) => redisKey += `:${item}`);
    // }
    // else {
    //   redisKey += `:${status}`;
    // }
    // orders = await this.redisService.get(redisKey);
    // if (orders) {
    //   return orders;
    // }
    orders = await this.orderRepo.find(query);
    // await this.redisService.set(redisKey, orders);
    return orders;
  }

  /**
   * Returns order by provided id
   * @param id id of order to get
   * @returns {Promise<OrderEntity>} order
   */
  async getOrderById(id: number): Promise<OrderEntity> {
    const order: OrderEntity = await this.orderRepo.findOne({ where: { id } ,relations:{
      shipper:{
        user:true
      }
    }});
    if (!order) {
      throw new BadRequestException("Order doesn't exist");
    }
    return order;
  }

  /**
   * Returns orders of user
   * @param {Request} req request to get token from headers
   * @param {RolesEnum} role role of user
   * @returns {Promise<OrderEntity[]>} promsie to return array of user orders
   */
  async getMyOrders(req: Request, status?: OrderStatus): Promise<OrderEntity[]> {
    let statusSuffix = '';
    if (Array.isArray(status)) {
      status.forEach((item) => statusSuffix += `:${item}`);
    }
    else {
      statusSuffix += `:${status}`;
    }
    const token = this.getDecodedToken(req);
    if (token.role === RolesEnum.CARRIER) {
      const carrier = await this.usersService.findOneCarrier(token.id, {
        user: false,
      });
      if (!carrier) {
        throw new BadRequestException("Carrier doesn't exist");
      }
      let orders;
      // let redisKey = 'orders:ordersService:carriers:status' + statusSuffix;
      // orders = await this.redisService.get(redisKey);
      // if (orders) {
      //   return orders;
      // }
      orders = this.orderRepo.find({ where: { carrier: { id: carrier.id }}});      
      // await this.redisService.set(redisKey, orders);
      return orders;
    }
    const shipper = await this.usersService.findOneShipper(token.id, {
      user: false,
    });
    const query = { where: { shipper: { id: shipper.id } }, relations: { shipper: { user: true }, carrier: { user: true }} };
    if (status) {
      query.where['status'] = In([...status]);
    }

    return this.orderRepo.find(query);
  }

  /**
   * Returns last location of carrier saved in redis
   */
  async getLastLocations(id: number) {
    const data = await this.redisService.get(`orders:navigation:${id}`);
    if (data) {
      return data;
    }
    return {
      message: 'Not found last location'
    };
  }

  private getDecodedToken(req: Request): UserToken {
    return this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ) as UserToken;
  }
}
