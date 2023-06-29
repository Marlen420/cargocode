import { Column } from "typeorm";
import { User } from "./user.entity";

export class Shipper extends User {
    @Column({ unique: true })
    physical_address: string;
    @Column({ unique: true })
    mc_dot_number: string;
}