import { OrderEntity } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity()
export class ShipperEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  billing_address: string;
  @OneToMany(() => OrderEntity, (order) => order.shipper)
  orders: OrderEntity[];
  @OneToOne(() => UserEntity, (user) => user.shipper)
  @JoinColumn()
  user: UserEntity;
}
