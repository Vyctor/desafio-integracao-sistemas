import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { OrderProducts } from './order-products.entity';
import { Customers } from '../../customers/entities/customer.entity';

@Entity({
  name: 'orders',
})
@Index(['date'])
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
