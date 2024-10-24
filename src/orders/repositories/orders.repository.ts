import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from '../entities/order.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersRepository {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
  ) {}

  create(params: { orderId: number; date: Date; customerId: number }) {
    const { orderId, date, customerId } = params;
    return this.ordersRepository.create({
      customer: { id: customerId },
      id: orderId,
      date: date,
    });
  }

  async save(order: Orders) {
    return this.ordersRepository.save(order);
  }
}
