import { Column } from 'typeorm';
import { User } from './user.entity';

export class Shipper extends User {
  @Column({ unique: true })
  billing_address: string;
}
