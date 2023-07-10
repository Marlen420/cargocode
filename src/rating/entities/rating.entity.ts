import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CarrierEntity } from '../../users/entities/carrier.entity';
import { ShipperEntity } from '../../users/entities/shipper.entity';
import { OrderEntity } from '../../orders/entities/order.entity';

@Entity()
export class RatingEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  rating: number;
  @Column()
  comment: string;
  @Column()
  date: Date;
  @ManyToOne(() => CarrierEntity, (carrier) => carrier.ratings)
  carrier: CarrierEntity;
  @ManyToOne(() => ShipperEntity, (shipper) => shipper.ratings)
  shipper: ShipperEntity;
  @ManyToOne(() => OrderEntity, (order) => order.ratings)
  order: OrderEntity;
}
