import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ShipperEntity } from './entities/shipper.entity';
import { CarrierEntity } from './entities/carrier.entity';
import { CreateShipperDto } from './dto/create-shipper.dto';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { CompaniesService } from 'src/companies/companies.service';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { AddEmployeeDto } from 'src/companies/dto/add-employee.dto';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { OperatorEntity } from './entities/operator.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ShipperEntity)
    private readonly shipperRepository: Repository<ShipperEntity>,
    @InjectRepository(CarrierEntity)
    private readonly carrierRepository: Repository<CarrierEntity>,
    @InjectRepository(OperatorEntity)
    private readonly operatorRepository: Repository<OperatorEntity>,
    private readonly redisService: RedisService,
    private readonly companiesService: CompaniesService,
  ) {}

  async createOperator(dto: CreateOperatorDto): Promise<OperatorEntity> {
    const company: CompanyEntity = await this.companiesService.findById(
      dto.company_id,
    );
    if (!company) {
      throw new BadRequestException('Company not found');
    }
    if (
      !company.employees_credential.some(
        (item: AddEmployeeDto) =>
          item.email === dto.email || item.phone === dto.phone,
      )
    ) {
      throw new BadRequestException('Employee not registered in company');
    }
    const user = await this.createUser(dto);
    return await this.operatorRepository
      .save({
        id: user.id,
      })
      .then(async (savedEmployee) => {
        const user = await this.findOne(savedEmployee.id);
        delete user.password;
        return { ...savedEmployee, ...user };
      })
      .then(async (savedEmployee) => {
        await this.redisService.set(
          `users:usersService:employee:${savedEmployee.id}`,
          savedEmployee,
        );
        return savedEmployee;
      });
  }

  async createShipper(dto: CreateShipperDto): Promise<ShipperEntity> {
    const user = await this.createUser(dto);
    return await this.shipperRepository
      .save({
        id: user.id,
        billing_address: dto.billing_address,
      })
      .then(async (savedShipper) => {
        const user = await this.findOne(savedShipper.id);
        delete user.password;
        return { ...savedShipper, ...user };
      })
      .then(async (savedShipper) => {
        await this.redisService.set(
          `users:usersService:shipper:${savedShipper.id}`,
          savedShipper,
        );
        return savedShipper;
      });
  }

  async createCarrier(dto: CreateCarrierDto): Promise<CarrierEntity> {
    let company: CompanyEntity = null;
    if (dto.company_id !== -1) {
      company = await this.companiesService.findById(dto.company_id);
      if (
        !company.employees_credential.some(
          (item: AddEmployeeDto) =>
            item.email === dto.email || item.phone === dto.phone,
        )
      ) {
        throw new BadGatewayException('Carrier is not registered in company');
      }
    }
    const user = await this.createUser(dto);
    const carrier = this.carrierRepository.create({
      id: user.id,
      physical_address: dto.physical_address,
      mc_dot_number: dto.mc_dot_number,
      company,
    });
    return await this.carrierRepository
      .save(carrier)
      .then(async (savedCarrier) => {
        const user = await this.findOne(savedCarrier.id);
        delete user.password;
        return { ...savedCarrier, ...user };
      })
      .then(async (savedCarrier) => {
        await this.redisService.set(
          `users:usersService:carrier:${savedCarrier.id}`,
          savedCarrier,
        );
        return savedCarrier;
      });
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
    return await this.userRepository.save(dto).then(async (savedUser) => {
      await this.redisService.set(
        `users:userService:user:${savedUser.id}`,
        savedUser,
      );
      return savedUser;
    });
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
    const user = await this.redisService.get(`users:userService:user:${id}`);
    if (user) {
      return user;
    }
    return await this.userRepository.findOne({ where: { id } });
  }

  async findOneShipper(
    id: number,
    options = { user: true },
  ): Promise<ShipperEntity> {
    const shipper = await this.redisService.get(
      `users:userService:shipper:${id}`,
    );
    const user = await this.findOne(id);
    delete user.password;
    if (shipper) {
      return options.user ? { ...shipper, ...user } : shipper;
    }
    return await this.shipperRepository
      .findOne({ where: { id } })
      .then(async (savedShipper) => {
        await this.redisService.set(
          `users:userService:shipper:${id}`,
          savedShipper,
        );
        return options.user ? { ...user, ...savedShipper } : savedShipper;
      });
  }

  async findOneCarrier(
    id: number,
    options = { user: true },
  ): Promise<CarrierEntity> {
    const carrier = await this.redisService.get(
      `users:userService:carrier:${id}`,
    );
    const user = await this.findOne(id);
    delete user.password;
    if (carrier) {
      return options.user ? { ...user, ...carrier } : carrier;
    }
    return await this.carrierRepository
      .findOne({ where: { id } })
      .then(async (savedCarrier) => {
        await this.redisService.set(
          `users:userService:carrier:${id}`,
          savedCarrier,
        );
        return options.user ? { ...user, ...savedCarrier } : savedCarrier;
      });
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
