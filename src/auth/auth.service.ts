import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(login: string, password: string): Promise<any> {
    const loginType: 'email' | 'phone' = this.defineLogin(login);
    const user: UserEntity =
      loginType === 'email'
        ? await this.userService.findOneByEmail(login)
        : await this.userService.findOneByPhone(login);
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        delete user.password;
        return { access_token: this.jwtService.sign(user) };
      }
    }
    throw new BadRequestException('Invalid login or password');
  }

  defineLogin(login: string): 'email' | 'phone' {
    const reg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (reg.test(login)) {
      return 'email';
    }
    return 'phone';
  }
}
