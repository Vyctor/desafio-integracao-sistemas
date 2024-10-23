import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FilesService } from '../../utils/files.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Customers } from '../entities/customer.entity';
import { OrderProducts } from '../entities/order-products.entity';
import { Orders } from '../entities/order.entity';
import { IntegrationControl } from '../entities/integration-control.entity';

@Injectable()
export class ImportOrdersFromFileUsecase {
  private readonly logger = new Logger(ImportOrdersFromFileUsecase.name);
  private readonly batchSize = 500;

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
        const customerMap = new Map<number, Customers>();
        const orderMap = new Map<number, Orders>();

        data.forEach((item) => {
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

        const chunkedCustomersData = Array.from(customerMap.values()).reduce(
          (acc, curr) => {
            if (acc[acc.length - 1].length === this.batchSize) {
              acc.push([]);
            }
            acc[acc.length - 1].push(curr);
            return acc;
          },
          [[]],
        );

        await Promise.all(
          chunkedCustomersData.map((chunk) => manager.save(Customers, chunk)),
        );

        const chumkedOrdersData = Array.from(orderMap.values()).reduce(
          (acc, curr) => {
            if (acc[acc.length - 1].length === this.batchSize) {
              acc.push([]);
            }
            acc[acc.length - 1].push(curr);
            return acc;
          },
          [[]],
        );

        await Promise.all(
          chumkedOrdersData.map((chunk) => manager.save(Orders, chunk)),
        );

        const orderProducts = data.map((item) =>
          manager.create(OrderProducts, {
            productId: item.prodId,
            value: parseFloat(item.value.toFixed(2)),
            order: orderMap.get(item.orderId),
          }),
        );

        const chumkedOrderProductsData = orderProducts.reduce(
          (acc, curr) => {
            if (acc[acc.length - 1].length === this.batchSize) {
              acc.push([]);
            }
            acc[acc.length - 1].push(curr);
            return acc;
          },
          [[]],
        );

        await Promise.all(
          chumkedOrderProductsData.map((chunk) =>
            manager.save(OrderProducts, chunk),
          ),
        );

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
}
