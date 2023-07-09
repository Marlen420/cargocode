import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { DeleteResult, Repository } from 'typeorm';
import { AddEmployeeDto } from './dto/add-employee.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';
import * as bcrypt from 'bcrypt';

interface UserToken {
  id: number;
  [key: string]: any;
}

/**
 * Class responsible for companies methods
 */
@Injectable()
export class CompaniesService {
  /**
   * Constructs companies service
   */
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Returns all companies
   */
  async findAll(): Promise<CompanyEntity[]> {
    return this.companyRepository.find();
  }

  /**
   * Returns copmany by provided id
   */
  async findById(id: number): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new BadRequestException('Company not found');
    }
    return company;
  }

  /**
   * Finds company by provided email
   */
  async findByEmail(email: string): Promise<CompanyEntity> {
    return this.companyRepository.findOne({ where: { email } });
  }

  /**
   * Creates new company
   */
  async createCompany(data: CreateCompanyDto): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { email: data.email },
    });
    if (company) {
      throw new BadRequestException('This email already signed up');
    }
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    return this.companyRepository.save(data);
  }

  /**
   * Adds employee to company
   */
  async addEmployee(
    req: Request,
    data: AddEmployeeDto,
  ): Promise<CompanyEntity> {
    const token: UserToken = this.getDecodedToken(req);
    if (!data.email && !data.phone) {
      throw new BadRequestException('Must be provided at least one option');
    }
    const company = await this.companyRepository.findOne({
      where: { id: token.id },
    });
    console.log(company,'company');
    // if (
    //   company.employees_credential.some(
    //     (item: AddEmployeeDto) =>
    //       item.email === data.email || item.phone === data.phone,
    //   )
    // ) {
    //   throw new BadRequestException('Credential already added');
    // }
    company.employees_credential.push(data);
    return this.companyRepository.save(company);
  }

  /**
   * Deletes company by provided id
   */
  async deleteById(id: number): Promise<DeleteResult> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new BadRequestException('Company not found');
    }
    return this.companyRepository.delete(id);
  }

  private getDecodedToken(req: Request): UserToken {
    return this.jwtService.decode(
      req.headers.authorization.split(' ')[1],
    ) as UserToken;
  }
}
