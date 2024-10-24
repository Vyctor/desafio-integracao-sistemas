import { Orders } from '../../orders/entities/order.entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity({ name: 'customers' })
export class Customers {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Orders, (order) => order.customer)
  order: Orders[];
}
