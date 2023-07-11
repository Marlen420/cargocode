import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AddEmployeeDto } from '../dto/add-employee.dto';
import { OperatorEntity } from 'src/users/entities/operator.entity';

@Entity()
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)'})
  created_at: Date;
  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  updated_at: Date;
  @Column({ default: RolesEnum.COMPANY })
  role: RolesEnum;
  @Column()
  name: string;
  @Column()
  insurance_id: string;
  @Column()
  address: string;
  @Column({ unique: true, nullable: true })
  login: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column()
  password: string;
  @OneToMany(() => CarrierEntity, (carrier) => carrier.company, { eager: true })
  carriers: CarrierEntity[];
  @OneToMany(() => OperatorEntity, (operator) => operator.company, { eager: true })
  operators: OperatorEntity[];
  
}
