import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { config } from 'dotenv';
import { CompanyEntity } from 'src/companies/entities/company.entity';
import { CompaniesService } from 'src/companies/companies.service';

config();

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) {}

  async loginUser(data: LoginDto): Promise<any> {
    const { login, password } = data;
    const isEmail: boolean = this.isEmail(login);
    const user: UserEntity = isEmail
      ? await this.usersService.findOneByEmail(login)
      : await this.usersService.findOneByPhone(login);
    if (user) {
      const passwordValid = await bcrypt.compare(password, user.password);
      if (passwordValid) {
        delete user.password;
        return { access_token: this.jwtService.sign({ ...user }) };
      }
    }
    const company: CompanyEntity = isEmail
      ? await this.companiesService.findByEmail(login)
      : await this.companiesService.findByLogin(login);
    if (company) {
      const passwordValid = await bcrypt.compare(password, company.password);
      if (passwordValid) {
        delete company.password;
        return { access_token: this.jwtService.sign({ ...company }) };
      }
    }
    throw new BadRequestException('Invalid login or password');
  }

  isEmail(login: string): boolean {
    const reg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (reg.test(login)) {
      return true;
    }
    return false;
  }
}
