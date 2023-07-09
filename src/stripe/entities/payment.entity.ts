import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { CarrierEntity } from '../../users/entities/carrier.entity';

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
  @OneToOne(() => CarrierEntity)
  carrier: CarrierEntity;
}
