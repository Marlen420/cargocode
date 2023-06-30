import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
@Entity()
export class ShipperEntity {
  @PrimaryColumn()
  @OneToOne(() => UserEntity, (e) => e.id)
  id: number;
  @Column()
  billing_address: string;
}