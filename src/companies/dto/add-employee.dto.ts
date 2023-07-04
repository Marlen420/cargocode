import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class AddEmployeeDto {
    @ApiProperty()
    @IsString()
    role: 'CARRIER' | 'OPERATOR'
    
    @ApiProperty()
    @IsString()
    firstname: string;

    @ApiProperty()
    @IsString()
    lastname: string;

    @ApiProperty()
    @IsOptional()
    @IsEmail()
    email: string | null;

    @ApiProperty()
    @IsOptional()
    @IsString()
    phone: string | null;
}