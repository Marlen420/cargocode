import { OrderEntity } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
@Entity()
export class ShipperEntity {
  @PrimaryColumn()
  @OneToOne(() => UserEntity, (e) => e.id)
  id: number;
  @Column()
  billing_address: string;
  @OneToMany(() => OrderEntity, (e) => e.shipper)
  orders: OrderEntity[];
}
