import { IsEmail, IsOptional, IsString } from "class-validator";

export class AddEmployeeDto {
    @IsString()
    role: 'CARRIER' | 'OPERATOR'
    
    @IsString()
    firstname: string;

    @IsString()
    lastname: string;

    @IsOptional()
    @IsEmail()
    email: string | null;

    @IsOptional()
    @IsString()
    phone: string | null;
}