import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)'})
  created_at: Date;
  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at: Date;
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
  @OneToOne(() => OperatorEntity, (e) => e.user, { nullable: true, onDelete: 'CASCADE' })
  operator: OperatorEntity;
}
