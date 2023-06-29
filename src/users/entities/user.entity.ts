import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../enums/roles.enum';
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
  @Column({ unique: true, nullable: false })
  email: string;
  @Column()
  password: string;
  @Column({ enum: Role })
  role: Role;
  @OneToOne(() => CarrierEntity, (e) => e.id, { nullable: true })
  carrier: CarrierEntity;
  @OneToOne(() => ShipperEntity, (e) => e.id, { nullable: true })
  shipper: ShipperEntity;
}
