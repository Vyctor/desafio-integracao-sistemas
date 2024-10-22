import { Entity, PrimaryColumn, Column, OneToMany, Index } from 'typeorm';
import { OrderProducts } from './order-products.entity';

@Entity({
  name: 'orders',
})
export class Orders {
  @PrimaryColumn()
  orderId: number;

  @Column({ type: 'integer', nullable: false })
  @Index()
  userId: number;

  @Column({ type: 'varchar', length: 45, nullable: false })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  total: number;

  @Column({ type: 'date', nullable: false })
  @Index()
  date: Date;

  @OneToMany(() => OrderProducts, (product) => product.order, { cascade: true })
  products: OrderProducts[];
}
