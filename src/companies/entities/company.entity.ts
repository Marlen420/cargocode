import { CarrierEntity } from 'src/users/entities/carrier.entity';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AddEmployeeDto } from '../dto/add-employee.dto';

@Entity()
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;
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
  @Column('jsonb', {nullable: true})
  employees_credential: AddEmployeeDto[];
  @OneToMany(() => CarrierEntity, (carrier) => carrier.company, { eager: true })
  carriers: CarrierEntity[];
}
