import { OrderEntity } from 'src/orders/entities/order.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';
import { CarrierEntity } from './carrier.entity';
import { ShipperEntity } from './shipper.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstname: string;
  @Column()
  lastname: string;
  @Column({ unique: true, nullable: false })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column()
  password: string;
  @Column({ enum: RolesEnum })
  role: RolesEnum;
  @OneToOne(() => CarrierEntity, (e) => e.id, { nullable: true })
  carrier: CarrierEntity;
  @OneToOne(() => ShipperEntity, (e) => e.id, { nullable: true })
  shipper: ShipperEntity;
}
