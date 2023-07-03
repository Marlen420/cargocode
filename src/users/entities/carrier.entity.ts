import { OrderEntity } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
@Entity()
export class CarrierEntity {
  @PrimaryColumn()
  @OneToOne(() => UserEntity, (e) => e.id)
  id: number;
  @Column()
  physical_address: string;
  @Column()
  mc_dot_number: string;
  @OneToMany(() => OrderEntity, (e) => e.carrier)
  orders: OrderEntity[];
}
