import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RolesEnum } from '../enums/roles.enum';

export class CreateShipperDto {
  id: number;
  @ApiProperty()
  @IsString()
  firstname: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty({ example: 'jhone@email.com' })
  @IsString()
  @IsEmail()
  email: string;

  role: RolesEnum;

  @ApiProperty()
  @IsString()
  @IsPhoneNumber('KG' || 'US')
  phone: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty()
  @IsString()
  billing_address: string;
}
