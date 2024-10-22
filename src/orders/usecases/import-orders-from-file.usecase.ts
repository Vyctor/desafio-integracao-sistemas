import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileToJsonContent, OrdersService } from '../orders.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Customers } from '../entities/customer.entity';
import { OrderProducts } from '../entities/order-products.entity';
import { Orders } from '../entities/order.entity';

@Injectable()
export class ImportOrdersFromFileUsecase {
  private readonly logger = new Logger(ImportOrdersFromFileUsecase.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly ordersService: OrdersService,
  ) {}

  async execute(file: Express.Multer.File): Promise<void> {
    try {
      this.logger.log('Iniciando a importação do arquivo de pedidos');

      const data = this.ordersService.transformOrdersFileToJson(file);
      this.logger.log('Arquivo transformado com sucesso');

      await this.dataSource.transaction(async (manager) => {
        const customers = this.makeCustomersData(data, manager);
        const orders = this.makeOrdersData(data, customers, manager);
        const orderProducts = this.makeOrderProductsData(data, orders, manager);

        this.logger.log('Salvando dados de clientes no banco de dados');
        await manager.save(Customers, customers);
        this.logger.log('Salvando dados de pedidos no banco de dados');
        await manager.save(Orders, orders);
        this.logger.log(
          'Salvando dados de produtos dos pedidos no banco de dados',
        );
        await manager.save(OrderProducts, orderProducts);
        this.logger.log('Arquivo importado com sucesso');
      });
    } catch (error) {
      this.logger.error('Erro ao importar arquivo', error);
      throw new UnprocessableEntityException(
        'Não foi possível importar o arquivo',
      );
    }
  }

  private makeCustomersData(data: FileToJsonContent, manager: EntityManager) {
    this.logger.log('Criando dados de clientes');
    const uniqueCustomers = data
      .map((item) => item.userId)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);

    return uniqueCustomers.map((userId) => {
      return manager.create(Customers, {
        id: userId,
        name: data.find((item) => item.userId === userId).name,
      });
    });
  }

  private makeOrdersData(
    data: FileToJsonContent,
    customers: Customers[],
    manager: EntityManager,
  ) {
    this.logger.log('Criando dados de pedidos');
    const uniqueOrders = data
      .map((item) => item.orderId)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);

    return uniqueOrders.map((orderId) => {
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
  }

  private makeOrderProductsData(
    data: FileToJsonContent,
    orders: Orders[],
    manager: EntityManager,
  ) {
    this.logger.log('Criando dados de produtos dos pedidos');
    return data
      .sort((a, b) => a.orderId - b.orderId)
      .map((item) => {
        return manager.create(OrderProducts, {
          productId: item.prodId,
          value: item.value,
          order: orders.find((order) => order.id === item.orderId),
        });
      });
  }
}
