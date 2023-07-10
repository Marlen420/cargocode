import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesEnum } from '../users/enums/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('rating')
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}
  @Roles(RolesEnum.SHIPPER)
  @UseGuards(RolesGuard)
  @Post()
  create(@Req() req: Request, @Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(req, createRatingDto);
  }
  @Roles(RolesEnum.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.ratingService.findAll();
  }
  @ApiOperation({ summary: `find rating by order id` })
  @Get('order/:id')
  findOrder(@Param('id') id: string) {
    return this.ratingService.findOrderById(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(+id);
  }
}
