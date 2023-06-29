import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RolesEnum } from '../enums/roles.enum';

export class CreateUserDto {
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
}
