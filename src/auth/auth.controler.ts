import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login-user')
  @ApiBody({type: LoginDto})
  login(@Body() data: LoginDto): Promise<{access_token: string}> {
    return this.authService.loginUser(data);
  }

  @Post('login-company')
  @ApiBody({type: LoginDto})
  loginCompany(@Body() data: LoginDto): Promise<{access_token: string}> {
    return this.loginCompany(data);
  }
}
