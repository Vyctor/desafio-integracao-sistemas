import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Customers } from './customer.entity';
import { OrderProducts } from './order-products.entity';

@Entity({
  name: 'orders',
})
export class Orders {
  @PrimaryColumn()
  id: number;

  @Column()
  date: Date;

  @ManyToOne(() => Customers, (customer) => customer.id)
  @JoinColumn({ name: 'customer_id' })
  customer: Customers;

  @OneToMany(() => OrderProducts, (orderProducts) => orderProducts.order)
  orderProducts: OrderProducts[];
}
