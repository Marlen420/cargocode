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
import { PaymentEntity } from '../../stripe/entities/payment.entity';
import { RatingEntity } from '../../rating/entities/rating.entity';
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
  @OneToMany(() => PaymentEntity, (payment) => payment.shipper)
  payments: PaymentEntity[];
  @OneToMany(() => RatingEntity, (rating) => rating.shipper)
  ratings: RatingEntity[];
}
