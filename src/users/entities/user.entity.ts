import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RolesEnum } from '../enums/roles.enum';
import { CarrierEntity } from './carrier.entity';
import { OperatorEntity } from './operator.entity';
import { ShipperEntity } from './shipper.entity';
import { RatingEntity } from '../../rating/entities/rating.entity';

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
  @Column({ nullable: true })
  resetPasswordToken: string;
  @Column({ enum: RolesEnum })
  role: RolesEnum;
  @OneToOne(() => CarrierEntity, (e) => e.user, { nullable: true })
  carrier: CarrierEntity;
  @OneToOne(() => ShipperEntity, (e) => e.user, { nullable: true })
  shipper: ShipperEntity;
  @OneToOne(() => OperatorEntity, (e) => e.user, { nullable: true })
  operator: OperatorEntity;
}
