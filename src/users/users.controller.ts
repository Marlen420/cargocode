import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { DeleteResult } from 'typeorm';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateShipperDto } from './dto/create-shipper.dto';
import { ShipperEntity } from './entities/shipper.entity';
import { CarrierEntity } from './entities/carrier.entity';
import { CreateCarrierDto } from './dto/create-carrier.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateCarrierDto })
  @ApiResponse({
    status: 201,
    description: 'The carrier has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('carrier')
  createCarrier(
    @Body() createCarrierDto: CreateCarrierDto,
  ): Promise<CarrierEntity> {
    return this.usersService.createCarrier(createCarrierDto);
  }
  @ApiOperation({ summary: 'Create a new shipper' })
  @ApiBody({ type: CreateShipperDto })
  @ApiResponse({
    status: 201,
    description: 'The shipper has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('shipper')
  async createShipper(
    @Body() createShipperDto: CreateShipperDto,
  ): Promise<ShipperEntity> {
    return this.usersService.createShipper(createShipperDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @ApiResponse({ status: 404, description: 'No users found' })
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return a user by ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserEntity> {
    return await this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'The user has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<DeleteResult> {
    return await this.usersService.remove(id);
  }
}
