import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Customers } from './entities/customer.entity';

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customers)
    private readonly customersRepository: Repository<Customers>,
  ) {}

  create(params: { id: number; name: string }) {
    const { id, name } = params;
    return this.customersRepository.create({
      id: id,
      name: name,
    });
  }

  async findOrdersByCustomer(params: {
    order_id?: number;
    min_date?: string;
    max_date?: string;
  }) {
    return await this.customersRepository.find({
      relations: ['order', 'order.orderProducts'],
      where: {
        order: {
          id: params?.order_id ? params.order_id : null,
          date:
            params?.min_date && params?.max_date
              ? Between(new Date(params?.min_date), new Date(params?.max_date))
              : null,
        },
      },
      order: {
        order: {
          date: 'DESC',
        },
      },
    });
  }
}
