import { CarrierEntity } from "src/users/entities/carrier.entity";
import { RolesEnum } from "src/users/enums/roles.enum";
import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { AddEmployeeDto } from "../dto/add-employee.dto";

@Entity()
export class CompanyEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    role: RolesEnum.COMPANY;
    @Column()
    name: string;
    @Column()
    insurance_id: string;
    @Column()
    address: string;
    @Column({unique: true, nullable: true})
    login: string;
    @Column({unique: true, nullable: true})
    email: string;
    @Column()
    password: string;
    @Column({array: true, type: 'json'})
    employees_credential: AddEmployeeDto[];
    @OneToMany(() => CarrierEntity, (carrier) => carrier.company, {eager: true})
    carriers: CarrierEntity[];
}