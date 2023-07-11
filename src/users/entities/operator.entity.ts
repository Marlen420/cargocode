import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CompanyEntity } from 'src/companies/entities/company.entity';

@Entity()
export class OperatorEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @OneToOne(() => UserEntity, (user) => user.operator, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity;
  @ManyToOne(() => CompanyEntity, (company) => company.carriers)
  company: CompanyEntity;
}
