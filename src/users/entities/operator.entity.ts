import {
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class OperatorEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => UserEntity, (user) => user.operator)
  @JoinColumn()
  user: UserEntity;
}
