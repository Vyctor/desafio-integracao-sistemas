import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Customers } from '../entities/customer.entity';
import { OrderProducts } from '../entities/order-products.entity';
import { Orders } from '../entities/order.entity';

export type ImportOrdersFromFileUsecaseInput = {
  orders: Array<{
    userId: number;
    name: string;
    orderId: number;
    prodId: number;
    value: number;
    date: Date;
  }>;
};

@Injectable()
export class ImportOrdersFromFileUsecase {
  private readonly logger = new Logger(ImportOrdersFromFileUsecase.name);
  private readonly batchSize = 1000;

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(input: ImportOrdersFromFileUsecaseInput): Promise<void> {
    this.logger.log('Iniciando a importação do arquivo de pedidos');

    try {
      await this.dataSource.transaction(async (manager) => {
        const { orders } = input;
        const customerMap = new Map<number, Customers>();
        const orderMap = new Map<number, Orders>();

        orders.forEach((item) => {
          if (!customerMap.has(item.userId)) {
            const customer = manager.create(Customers, {
              id: item.userId,
              name: item.name,
            });
            customerMap.set(item.userId, customer);
          }

          if (!orderMap.has(item.orderId)) {
            const order = manager.create(Orders, {
              id: item.orderId,
              date: item.date,
              customer: customerMap.get(item.userId),
            });
            orderMap.set(item.orderId, order);
          }
        });

        const orderProducts = orders.map((item) =>
          manager.create(OrderProducts, {
            productId: item.prodId,
            value: parseFloat(item.value.toFixed(2)),
            order: orderMap.get(item.orderId),
          }),
        );

        await manager.save(Array.from(customerMap.values()), {
          transaction: true,
          chunk: this.batchSize,
        });

        await manager.save(Array.from(orderMap.values()), {
          transaction: true,
          chunk: this.batchSize,
        });
        await manager.save(orderProducts, {
          transaction: true,
          chunk: this.batchSize,
        });

        this.logger.log('Arquivo importado com sucesso');
      });
    } catch (error) {
      this.logger.error('Erro ao importar arquivo', error);
      throw new UnprocessableEntityException('Erro ao importar arquivo');
    }
  }
}
