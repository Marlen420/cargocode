import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ShipperEntity } from './entities/shipper.entity';
import { CarrierEntity } from './entities/carrier.entity';
import { CreateShipperDto } from './dto/create-shipper.dto';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ShipperEntity)
    private readonly shipperRepository: Repository<ShipperEntity>,
    @InjectRepository(CarrierEntity)
    private readonly carrierRepository: Repository<CarrierEntity>,
  ) {}
  async createShipper(dto: CreateShipperDto): Promise<ShipperEntity> {
    const user = await this.createUser(dto);
    return this.shipperRepository.save({
      id: user.id,
      billing_address: dto.billing_address,
    });
  }
  async createCarrier(dto: CreateCarrierDto): Promise<CarrierEntity> {
    const user = await this.createUser(dto);
    const carrier = this.carrierRepository.create({
      id: user.id,
      physical_address: dto.physical_address,
      mc_dot_number: dto.mc_dot_number,
    });
    return await this.carrierRepository.save(carrier);
  }
  async createUser(dto: CreateUserDto): Promise<UserEntity> {
    const registeredUser = await this.userRepository.findOne({
      where: [{ phone: dto.phone }, { email: dto.email }],
    });
    if (registeredUser) {
      throw new BadRequestException('User has been registered');
    }
    const salt = await bcrypt.genSalt(10);
    dto.password = await bcrypt.hash(dto.password, salt);
    return this.userRepository.save(dto);
  }
  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneByPhone(phone: string): Promise<UserEntity> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findOne(id: number): Promise<UserEntity> {
    return await this.userRepository.findOne({ where: { id } });
  }
  async remove(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete({ id });
  }
  private async hashPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(pass, salt);
  }
  private async validatePassword(
    pass: string,
    hashPass: string,
  ): Promise<boolean> {
    return bcrypt.compare(pass, hashPass);
  }
}
