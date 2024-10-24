import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderProducts } from '../entities/order-products.entity';

@Injectable()
export class OrderProductsRepository {
  constructor(
    @InjectRepository(OrderProducts)
    private readonly ordersProductsRepository: Repository<OrderProducts>,
  ) {}

  create(params: { productId: number; value: number; orderId: number }) {
    const { productId, value, orderId } = params;

    return this.ordersProductsRepository.create({
      productId: productId,
      value: parseFloat(value.toFixed(2)),
      order: { id: orderId },
    });
  }

  async save(orderProduct: OrderProducts) {
    return this.ordersProductsRepository.save(orderProduct);
  }
}
