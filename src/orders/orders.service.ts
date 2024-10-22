import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Orders } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
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
    const groupedOrders: {
      [orderId: number]: Array<{
        userId: number;
        name: string;
        orderId: number;
        prodId: number;
        value: number;
        date: Date;
      }>;
    } = {};

    for (const order of data) {
      if (!groupedOrders[order.orderId]) {
        groupedOrders[order.orderId] = [];
      }
      groupedOrders[order.orderId].push(order);
    }

    const payloadToSave = Object.values(groupedOrders).map((orders) => {
      const total = parseFloat(
        orders.reduce((acc, curr) => acc + curr.value, 0).toFixed(2),
      );
      const { userId, name, orderId, date } = orders[0];
      const products = orders.map((order) => ({
        productId: order.prodId,
        value: order.value,
      }));
      return { userId, name, orderId, total, date, products };
    });

    const savedRows = await this.dataSource.manager.transaction(
      async (manager) => {
        const inserts = payloadToSave.map(async (order) => {
          await manager.save(Orders, {
            orderId: order.orderId,
            userId: order.userId,
            name: order.name,
            total: order.total,
            date: order.date,
            products: order.products.map((product) => {
              return {
                productId: product.productId,
                value: product.value,
                order: {
                  orderId: order.orderId,
                },
              };
            }),
          });
        });

        await Promise.all(inserts);
        return inserts.length;
      },
    );

    return { message: `${savedRows} orders saved successfully` };
  }
}
