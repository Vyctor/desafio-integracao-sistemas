import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FileToJsonContent, FilesService } from '../../utils/files.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Customers } from '../entities/customer.entity';
import { OrderProducts } from '../entities/order-products.entity';
import { Orders } from '../entities/order.entity';
import { IntegrationControl } from '../entities/integration-control.entity';

@Injectable()
export class ImportOrdersFromFileUsecase {
  private readonly logger = new Logger(ImportOrdersFromFileUsecase.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(file: Express.Multer.File): Promise<void> {
    this.logger.log('Iniciando a importação do arquivo de pedidos');

    const fileExtension = FilesService.getFileExtension(file);

    if (fileExtension !== 'txt') {
      throw new UnprocessableEntityException(
        'Formato de arquivo inválido. Aceito apenas arquivos .txt',
      );
    }

    const fileHash = FilesService.hashOrdersFile(file);

    await this.validateIfFileAlreadyImported(fileHash);

    const data = FilesService.transformOrdersFileToJson(file);
    this.logger.log('Arquivo transformado com sucesso');

    try {
      await this.dataSource.transaction(async (manager) => {
        const customers = this.makeCustomersData(data);
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

        await manager.insert(IntegrationControl, {
          filename: file.originalname,
          hash: fileHash,
        });
      });
    } catch (error) {
      this.logger.error('Erro ao importar arquivo', error);
      throw new UnprocessableEntityException('Erro ao importar arquivo');
    }
  }

  private async validateIfFileAlreadyImported(fileHash: string): Promise<void> {
    const fileAlreadyImported = await this.dataSource
      .getRepository(IntegrationControl)
      .findOne({
        where: {
          hash: fileHash,
        },
      });

    if (fileAlreadyImported) {
      const errorMessage = `Arquivo já importado na data de ${fileAlreadyImported.createdAt.toISOString()} com o nome de ${fileAlreadyImported.filename}`;

      this.logger.error(
        JSON.stringify({
          error: errorMessage,
          file: fileAlreadyImported,
        }),
      );
      throw new ConflictException(errorMessage);
    }

    this.logger.log('Arquivo não importado anteriormente');
  }

  private makeCustomersData(data: FileToJsonContent) {
    this.logger.log('Criando dados de clientes');

    // Create a map for quick lookups
    const customerData = new Map<number, { id: number; name: string }>();

    data.forEach((item) => {
      if (!customerData.has(item.userId)) {
        customerData.set(item.userId, { id: item.userId, name: item.name });
      }
    });

    return Array.from(customerData.values()).map((customer) =>
      this.dataSource.manager.create(Customers, customer),
    );
  }

  private makeOrdersData(
    data: FileToJsonContent,
    customers: Customers[],
    manager: EntityManager,
  ) {
    this.logger.log('Criando dados de pedidos');

    // Create a map for quick lookups
    const ordersMap = new Map<
      number,
      { id: number; date: Date; customer: Customers }
    >();

    data.forEach((item) => {
      if (!ordersMap.has(item.orderId)) {
        const customer = customers.find((c) => c.id === item.userId);
        ordersMap.set(item.orderId, {
          id: item.orderId,
          date: item.date,
          customer,
        });
      }
    });

    return Array.from(ordersMap.values()).map((order) =>
      manager.create(Orders, order),
    );
  }

  private makeOrderProductsData(
    data: FileToJsonContent,
    orders: Orders[],
    manager: EntityManager,
  ) {
    this.logger.log('Criando dados de produtos dos pedidos');

    // Create order ID map for quick lookups
    const ordersMap = new Map<number, Orders>();
    orders.forEach((order) => {
      ordersMap.set(order.id, order);
    });

    return data.map((item) => {
      const order = ordersMap.get(item.orderId);
      return manager.create(OrderProducts, {
        productId: item.prodId,
        value: parseFloat(item.value.toFixed(2)),
        order,
      });
    });
  }
}
