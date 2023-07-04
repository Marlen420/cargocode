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
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { DeleteResult } from 'typeorm';
import { CompaniesService } from './companies.service';
import { AddEmployeeDto } from './dto/add-employee.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyEntity } from './entities/company.entity';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(): Promise<CompanyEntity[]> {
    return this.companiesService.findAll();
  }

  @Post('create-company')
  async createCompany(@Body() data: CreateCompanyDto): Promise<CompanyEntity> {
    return this.companiesService.createCompany(data);
  }

  @Roles(RolesEnum.COMPANY)
  @UseGuards(RolesGuard)
  @Post('add-employee')
  async addCarrier(
    @Req() req: Request,
    @Body() data: AddEmployeeDto,
  ): Promise<CreateCompanyDto> {
    return this.companiesService.addEmployee(req, data);
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<DeleteResult> {
    return this.companiesService.deleteById(+id);
  }
}
