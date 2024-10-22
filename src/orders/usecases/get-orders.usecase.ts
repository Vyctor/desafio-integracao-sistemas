import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders } from '../entities/order.entity';
import { Between, Repository } from 'typeorm';
import { Customers } from '../entities/customer.entity';

@Injectable()
export class GetOrdersUsecase {
  constructor(
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
    @InjectRepository(Customers)
    private readonly customersRepository: Repository<Customers>,
  ) {}

  public async execute(params: {
    order_id: number;
    min_date: string;
    max_date: string;
  }) {
    const customersWithOrders = await this.customersRepository.find({
      relations: ['order', 'order.orderProducts'],
      where: {
        order: {
          id: params.order_id ? params.order_id : null,
          date:
            params.min_date && params.max_date
              ? Between(new Date(params.min_date), new Date(params.max_date))
              : null,
        },
      },
      order: {
        order: {
          date: 'DESC',
        },
      },
    });

    return customersWithOrders.map((customerWithOrder) => {
      return {
        user_id: customerWithOrder.id,
        name: customerWithOrder.name,
        orders: customerWithOrder.order.map((order) => {
          return {
            order_id: order.id,
            total: order.total,
            date: order.date,
            products: order.orderProducts.map((orderProduct) => {
              return {
                product_id: orderProduct.productId,
                value: orderProduct.value,
              };
            }),
          };
        }),
      };
    });
  }
}
