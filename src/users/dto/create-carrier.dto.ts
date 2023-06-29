import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RolesEnum } from '../enums/roles.enum';

export class CreateCarrierDto {
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

  @ApiProperty({
    enum: RolesEnum,
    isArray: false,
    example: RolesEnum.SHIPPER,
  })
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
  physical_address: string;

  @ApiProperty()
  @IsString()
  mc_dot_number: string;
}
