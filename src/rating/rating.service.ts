import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingEntity } from './entities/rating.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/enums/orderStatus.enum';

interface UserToken {
  id: number;
  [key: string]: any;
}

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(RatingEntity)
    private readonly ratingRepo: Repository<RatingEntity>,
    private jwtService: JwtService,
    private ordersService: OrdersService,
    private userService: UsersService,
  ) {}
  async create(req, createRatingDto: CreateRatingDto) {
    const token = this.getDecodedToken(req);
    const shipper = await this.userService.findShipperByUserId(token.id);
    if (!shipper) {
      throw new BadRequestException('Shipper not found');
    }
    const order = await this.ordersService.findOne(createRatingDto.orderId);
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    if (order.status !== OrderStatus.finished) {
      throw new BadRequestException(
        `Order status is not ${OrderStatus.finished}`,
      );
    }
    createRatingDto.order = order;
    createRatingDto.shipper = shipper;
    createRatingDto.carrier = await this.userService.findCarrierById(
      order.carrier.id,
    );
    return await this.ratingRepo.save(createRatingDto);
  }

  findAll() {
    return this.ratingRepo.find({
      relations: ['shipper', 'carrier', 'order'],
    });
  }
  findOrderById(id: number) {
    return this.ratingRepo.find({
      where: {
        order: {
          id,
        },
      },
      relations: {
        shipper: {
          user: true,
        },
      },
    });
  }
  findOne(id: number) {
    return this.ratingRepo.findOne({
      where: { id },
      relations: ['shipper', 'carrier', 'order'],
    });
  }
  private getDecodedToken(req: Request): UserToken {
    return this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ) as UserToken;
  }
}
