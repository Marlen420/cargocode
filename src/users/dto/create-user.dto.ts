import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';

export class CreateUserDto {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  role: RolesEnum;
}
