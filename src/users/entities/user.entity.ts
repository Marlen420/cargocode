import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/roles.enum';

@Entity()
export abstract class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  firstname: string;
  @Column()
  lastname: string;
  @Column({ unique: true, nullable: false })
  phone: string;
  @Column({ unique: true, nullable: false })
  email: string;
  @Column()
  password: string;
  @Column({ enum: Role })
  role: Role;
}
