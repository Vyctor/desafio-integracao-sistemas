import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Orders } from './entities/order.entity';
import { Customers } from './entities/customer.entity';
import { OrderProducts } from './entities/order-products.entity';
import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Orders)
    private readonly ordersRepository: Repository<Orders>,
  ) {}

  async saveOrders(
    data: Array<{
      userId: number;
      name: string;
      orderId: number;
      prodId: number;
      value: number;
      date: Date;
    }>,
  ): Promise<any> {
    await this.dataSource.transaction(async (manager) => {
      const uniqueCustomers = data
        .map((item) => item.userId)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => a - b);

      const customers = uniqueCustomers.map((userId) => {
        return manager.create(Customers, {
          id: userId,
          name: data.find((item) => item.userId === userId).name,
        });
      });

      await manager.insert(Customers, customers);

      const uniqueOrders = data
        .map((item) => item.orderId)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort((a, b) => a - b);

      const orders = uniqueOrders.map((orderId) => {
        return manager.create(Orders, {
          id: orderId,
          total: data
            .filter((item) => item.orderId === orderId)
            .reduce((acc, item) => acc + item.value, 0),
          date: data.find((item) => item.orderId === orderId).date,
          customer: customers.find(
            (customer) =>
              customer.id ===
              data.find((item) => item.orderId === orderId).userId,
          ),
        });
      });

      const orderProducts = data
        .sort((a, b) => a.orderId - b.orderId)
        .map((item) => {
          return manager.create(OrderProducts, {
            productId: item.prodId,
            value: item.value,
            order: orders.find((order) => order.id === item.orderId),
          });
        });

      await manager.save(Orders, orders);
      await manager.upsert(OrderProducts, orderProducts, ['id']);
    });
  }

  async getOrders(query: PaginateQuery) {
    const result = await paginate(query, this.ordersRepository, {
      sortableColumns: ['date'],
      defaultLimit: 50,
      maxLimit: 1000,
      filterableColumns: {
        date: [FilterOperator.GT, FilterOperator.LT],
      },
      relations: ['customer', 'orderProducts'],
    });

    if (result?.data?.length === 0) {
      throw new NotFoundException('Nenhum pedido encontrado.');
    }

    return result;
  }
}
