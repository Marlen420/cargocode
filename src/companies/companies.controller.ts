import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { DeleteResult } from 'typeorm';
import { CompaniesService } from './companies.service';
import { AddEmployeeDto } from './dto/add-employee.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';

@ApiBearerAuth()
@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(): Promise<CompanyEntity[]> {
    return this.companiesService.findAll();
  }

  @Roles(RolesEnum.COMPANY)
  @UseGuards(RolesGuard)
  @Get('employees')
  async getEmployees(@Req() req: Request) {
    return this.companiesService.getEmployees(req);
  }

  @Post('create-company')
  async createCompany(@Body() data: CreateCompanyDto): Promise<CompanyEntity> {
    return this.companiesService.createCompany(data);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<DeleteResult> {
    return this.companiesService.deleteById(+id);
  }
}
