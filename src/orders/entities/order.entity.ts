import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { ShipperEntity } from 'src/users/entities/shipper.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Currency } from '../enums/currency.enum';
import { OrderStatus } from '../enums/orderStatus.enum';
import { RatingEntity } from '../../rating/entities/rating.entity';

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;
  @ManyToOne(() => ShipperEntity, (shipper) => shipper.orders, { eager: true })
  shipper: ShipperEntity;
  @ManyToOne(() => CarrierEntity, (carrier) => carrier.orders, {
    eager: true,
    nullable: true,
  })
  carrier: CarrierEntity;
  @Column()
  price: number;
  @Column({ enum: Currency, default: Currency.usd })
  currency: Currency;
  @Column({ type: 'varchar', length: 256 })
  pickup_location: string;
  @Column({ type: 'varchar', length: 256 })
  destination: string;
  @Column({ type: 'varchar', length: 20 })
  pickup_latitude: string;
  @Column({ type: 'varchar', length: 20 })
  pickup_longitude: string;
  @Column({ type: 'varchar', length: 20 })
  destination_latitude: string;
  @Column({ type: 'varchar', length: 20 })
  destination_longitude: string;
  @Column({ type: 'date', nullable: false })
  pickup_date: Date;
  @Column({ type: 'date', nullable: false })
  delivery_date: Date;
  @Column()
  weight: number;
  @Column()
  type: string;
  @Column({ nullable: true })
  required_equipment: string;
  @Column({ nullable: true })
  special_instructions: string;
  @Column({ enum: OrderStatus })
  status: OrderStatus;
  @Column({ type: 'boolean', default: true })
  active: boolean;
  @Column({ type: 'varchar', nullable: true })
  acceptance_image: string;
  @OneToMany(() => RatingEntity, (rating) => rating.order)
  ratings: RatingEntity[];
}
