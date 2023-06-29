import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Role } from '../enums/roles.enum';

export class CreateUserDto {
  firstname: string;

  lastname: string;

  @ApiProperty({ example: 'jhone@email.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: Role,
    isArray: false,
    example: Role.receiver,
  })
  role: Role;

  @ApiProperty()
  @IsString()
  @IsPhoneNumber('KG' || 'RU')
  phone: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
