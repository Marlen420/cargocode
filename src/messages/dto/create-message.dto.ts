import { ApiProperty } from "@nestjs/swagger";

export class CreateMessageDto {
    @ApiProperty({type: 'string', nullable: false})
    text: string;
    
    @ApiProperty({type: 'number' , nullable: false})
    authorId: number;

    @ApiProperty({type: 'number', nullable: false})
    orderId: number;
}