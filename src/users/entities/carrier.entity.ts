import {Column, Entity, OneToOne, PrimaryColumn} from 'typeorm';
import { UserEntity } from './user.entity';
@Entity()
export class CarrierEntity {
  @PrimaryColumn()
  @OneToOne(() => UserEntity, (e) => e.id)
  id: number;
  @Column({ unique: true })
  physical_address: string;
  @Column({ unique: true })
  mc_dot_number: string;
}
