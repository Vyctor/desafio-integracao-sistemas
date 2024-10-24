import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Customers } from '../../customers/entities/customer.entity';
import { OrderProducts } from '../entities/order-products.entity';
import { Orders } from '../entities/order.entity';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderProductsRepository } from '../repositories/order-products.repository';
import { CustomersRepository } from '../../customers/customers.repository';

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
    private readonly customersRepository: CustomersRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly orderProductsRepository: OrderProductsRepository,
  ) {}

  async execute(input: ImportOrdersFromFileUsecaseInput): Promise<void> {
    this.logger.log('Iniciando a importação do arquivo de pedidos');

    const { orders } = input;
    const customerMap = new Map<number, Customers>();
    const orderMap = new Map<number, Orders>();

    orders.forEach((item) => {
      if (!customerMap.has(item.userId)) {
        const customer = this.customersRepository.create({
          id: item.userId,
          name: item.name,
        });
        customerMap.set(item.userId, customer);
      }

      if (!orderMap.has(item.orderId)) {
        const order = this.ordersRepository.create({
          orderId: item.orderId,
          date: item.date,
          customerId: customerMap.get(item.userId).id,
        });
        orderMap.set(item.orderId, order);
      }
    });

    const orderProducts = orders.map((item) =>
      this.orderProductsRepository.create({
        productId: item.prodId,
        value: parseFloat(item.value.toFixed(2)),
        orderId: orderMap.get(item.orderId).id,
      }),
    );

    try {
      await this.dataSource.transaction(async (manager) => {
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
      });
      this.logger.log('Arquivo importado com sucesso');
    } catch (error) {
      this.logger.error('Erro ao importar arquivo', error);
      throw new UnprocessableEntityException('Erro ao importar arquivo');
    }
  }
}
