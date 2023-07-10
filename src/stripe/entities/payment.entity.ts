import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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
  @ManyToOne(() => CarrierEntity, (carrier) => carrier.payments, {
    nullable: true,
  })
  carrier: CarrierEntity;
  @ManyToOne(() => ShipperEntity, (shipper) => shipper.payments)
  shipper: ShipperEntity;
}
