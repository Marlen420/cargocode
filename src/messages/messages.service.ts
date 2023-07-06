import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersService } from "src/users/users.service";
import { Repository } from "typeorm";
import { CreateMessageDto } from "./dto/create-message.dto";
import { MessageEntity } from "./entities/message.entity";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(MessageEntity)
        private readonly messageRepo: Repository<MessageEntity>,
        private readonly userService: UsersService
    ) {}
    
    /**
     * Finds messages by room id (id of order is room id)
     */
    async findMessageByRoom(id: number): Promise<MessageEntity[]> {
        return this.messageRepo.find({where: {id}});
    }

    /**
     * Creates message
     */
    async createMessage(data: CreateMessageDto): Promise<MessageEntity> {
        const message = new MessageEntity();
        const user = await this.userService.findOne(data.authorId);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        message.author = user;
        Object.assign(message, data);
        return this.messageRepo.save(message);
    }
}