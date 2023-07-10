import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { ROLES_KEY } from '../decorators/role.decorator';
require('dotenv').config();
interface UserToken {
  role: RolesEnum;
  [key: string]: any;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      (RolesEnum | 'ALL')[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredRoles) {
      return true;
    }
    try {
      const { headers }: Request = context.switchToHttp().getRequest();
      const token: string = headers.authorization.split(' ')[1];
      const decodedToken = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      }) as UserToken;
      return requiredRoles.some(
        (role) => role === 'ALL' || role === decodedToken.role,
      );
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
