import { ApiProperty } from '@nestjs/swagger';
import { IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsPhoneNumber('KG' || 'RU')
  phone: string;

  @ApiProperty()
  @IsString()
  @IsStrongPassword()
  password: string;
}
