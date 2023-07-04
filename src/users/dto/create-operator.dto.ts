import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { RolesEnum } from '../enums/roles.enum';

export class CreateOperatorDto {
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
    example: RolesEnum.CARRIER,
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
  @IsNumber()
  company_id: number;
}
