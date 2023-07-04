import { IsString, IsStrongPassword } from "class-validator";

export class CreateCompanyDto {
    @IsString()
    name: string;
    @IsString()
    address: string;
    @IsString()
    insurance_id: string;
    @IsString()
    login: string;
    @IsString()
    email: string;
    @IsStrongPassword()
    password: string;
}