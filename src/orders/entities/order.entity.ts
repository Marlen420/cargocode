import { UserEntity } from "src/users/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => UserEntity, user => user.orders)
    user: UserEntity;
}