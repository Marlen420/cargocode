import { CompanyEntity } from 'src/companies/entities/company.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { PaymentEntity } from '../../stripe/entities/payment.entity';
@Entity()
export class CarrierEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  physical_address: string;
  @Column()
  mc_dot_number: string;
  @OneToMany(() => OrderEntity, (e) => e.carrier)
  orders: OrderEntity[];
  @ManyToOne(() => CompanyEntity, (e) => e.carriers, { nullable: true })
  company: CompanyEntity;
  @OneToOne(() => PaymentEntity, (payment) => payment.carrier, {
    nullable: true,
  })
  payments: PaymentEntity;
  @OneToOne(() => UserEntity, (user) => user.carrier)
  @JoinColumn()
  user: UserEntity;
}
