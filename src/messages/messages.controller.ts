import { Controller, Get, Param } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { MessageEntity } from "./entities/message.entity";

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService
  ) {}

  @Get('order/:id')
  @ApiOperation({summary: 'Finds order chat messages by order id'})
  async getOrderMessages(@Param('id') id: string): Promise<MessageEntity[]> {
    return this.messagesService.findMessageByRoom(+id);
  }
}