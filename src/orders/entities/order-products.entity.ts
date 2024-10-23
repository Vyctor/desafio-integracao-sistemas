import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Orders } from './order.entity';

@Entity({
  name: 'order_products',
})
@Index(['productId', 'order'])
export class OrderProducts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  productId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  value: number;

  @ManyToOne(() => Orders, (order) => order.orderProducts)
  @JoinColumn({ name: 'order_id' })
  order: Orders;
}
