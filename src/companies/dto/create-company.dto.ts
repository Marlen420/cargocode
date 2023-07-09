import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  insurance_id: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
