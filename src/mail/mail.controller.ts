import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesEnum } from '../users/enums/roles.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Roles(RolesEnum.COMPANY)
  @UseGuards(RolesGuard)
  @Post('send')
  sendMail(@Body() dto: SendMailDto) {
    return this.mailService.sendPasswordToEmail(dto);
  }
}
