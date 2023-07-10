import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { CarrierEntity } from '../../users/entities/carrier.entity';
import { ShipperEntity } from '../../users/entities/shipper.entity';
@Entity()
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  total: number;
  @Column({ default: new Date() })
  date: Date;
  @OneToOne(() => OrderEntity)
  @JoinColumn()
  order: OrderEntity;
  @OneToOne(() => CarrierEntity, (carrier) => carrier.payments, {
    nullable: true,
  })
  @JoinColumn()
  carrier: CarrierEntity;
  @OneToOne(() => ShipperEntity, (shipper) => shipper.payments)
  @JoinColumn()
  shipper: ShipperEntity;
}
