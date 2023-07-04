import { Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class OperatorEntity {
  @PrimaryColumn()
  @OneToOne(() => UserEntity, (e) => e.id)
  id: number;
}
