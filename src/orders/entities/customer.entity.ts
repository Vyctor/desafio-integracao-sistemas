import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Orders } from './order.entity';

@Entity({ name: 'customers' })
export class Customers {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Orders, (order) => order.customer)
  order: Orders[];
}
