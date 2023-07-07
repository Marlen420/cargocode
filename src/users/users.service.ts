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
import { RedisService } from 'src/redis/redis.service';
import { CompaniesService } from 'src/companies/companies.service';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { AddEmployeeDto } from 'src/companies/dto/add-employee.dto';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { OperatorEntity } from './entities/operator.entity';
import { RolesEnum } from './enums/roles.enum';
import { MailService } from '../mail/mail.service';
const { v4: uuidv4 } = require('uuid');
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
    private readonly mailService: MailService,
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
    const operator = this.operatorRepository.create({
      user,
    });
    const registeredOperator = await this.operatorRepository.save(operator);
    delete registeredOperator.user.password;
    return registeredOperator;
  }

  async createShipper(dto: CreateShipperDto): Promise<ShipperEntity> {
    const user = await this.createUser(dto);
    const registeredShipper = await this.shipperRepository.save({
      billing_address: dto.billing_address,
      user,
    });
    delete registeredShipper.user.password;
    return registeredShipper;
  }

  async createCarrier(dto: CreateCarrierDto): Promise<CarrierEntity> {
    let company: CompanyEntity = null;
    if (dto.company_id !== -1) {
      company = await this.companiesService.findById(dto.company_id);
      if (
        company &&
        !company.employees_credential.some(
          (item: AddEmployeeDto) =>
            item.email === dto.email || item.phone === dto.phone,
        )
      ) {
        throw new BadRequestException('Carrier is not registered in company');
      }
    }
    const user = await this.createUser(dto);
    const carrier = this.carrierRepository.create({
      physical_address: dto.physical_address,
      mc_dot_number: dto.mc_dot_number,
      company,
      user,
    });
    const registeredCarrier = await this.carrierRepository.save(carrier);
    delete registeredCarrier.user.password;
    return registeredCarrier;
  }
  async resetPassword(id, password) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    await this.userRepository.save(user);
    return { message: 'Password changed' };
  }
  async checkPassword(email, resetPassword) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch = await bcrypt.compare(
      resetPassword,
      user.resetPasswordToken,
    );
    if (!isMatch) {
      throw new BadRequestException('Invalid code');
    }
    return { id: user.id };
  }
  async recoverPassword({ email }) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const uuid = uuidv4();
    const code = uuid.replace(/-/g, '').substring(0, 4);
    await this.mailService.sendMail(
      email,
      'recover password',
      `
           <h1>Ваш 4-значный код:</h1>
      <p>${code}</p>
      <p>Сохраните этот код в надежном месте.</p>
        `,
    );
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordToken = await bcrypt.hash(code, salt);
    await this.userRepository.save(user);
    return { message: 'Code sent' };
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
    return await this.userRepository.find({
      select: ['id', 'firstname', 'lastname', 'phone', 'email', 'role'],
    });
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findOneByPhone(phone: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      select: ['id', 'firstname', 'lastname', 'phone', 'email', 'role'],
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.role === RolesEnum.OPERATOR) {
      const operator = await this.operatorRepository.findOne({
        where: { user: { id } },
      });
      return { ...user, ...operator };
    }
    if (user.role === RolesEnum.SHIPPER) {
      const shipper = await this.shipperRepository.findOne({
        where: { user: { id } },
      });
      return { ...user, ...shipper };
    }
    if (user.role === RolesEnum.CARRIER) {
      const carrier = await this.carrierRepository.findOne({
        where: { user: { id } },
      });
      return { ...user, ...carrier };
    }
    return user;
  }

  async findOneShipper(
    id: number,
    options = { user: true },
  ): Promise<ShipperEntity> {
    const user = await this.findOne(id);
    delete user.password;
    const shipper = await this.shipperRepository.findOne({
      where: { user: { id } },
    });
    if (!shipper) {
      throw new BadRequestException('Shipper not found');
    }
    delete user.password;
    return options.user ? { ...user, ...shipper } : shipper;
  }

  async findOneCarrier(
    id: number,
    options = { user: true },
  ): Promise<CarrierEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    delete user.password;
    const carrier = await this.carrierRepository.findOne({
      where: { user: { id } },
      relations: { user: true },
    });
    if (!carrier) {
      throw new BadRequestException('Carrier not found');
    }
    return options.user
      ? await this.carrierRepository.findOne({ where: { id } })
      : carrier;
  }

  async remove(id: number): Promise<DeleteResult> {
    const user = await this.findOne(id);
    if (user.role === RolesEnum.CARRIER) {
      await this.carrierRepository.delete({ user: { id } });
      return await this.userRepository.delete({ id });
    }
    await this.shipperRepository.delete({ user: { id } });
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
