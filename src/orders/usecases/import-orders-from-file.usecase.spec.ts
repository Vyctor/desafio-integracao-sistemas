import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from '../entities/order.entity';
import { OrderProducts } from '../entities/order-products.entity';
import { IntegrationControl } from '../../integration-control/entities/integration-control.entity';
import { ImportOrdersFromFileUsecase } from './import-orders-from-file.usecase';
import { GetOrdersUsecase } from './get-orders.usecase';
import { DataSource } from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';
import { Customers } from '../../customers/entities/customer.entity';
import { CustomersModule } from '../../customers/customers.module';

describe('ImportOrdersFromFileUsecase unit tests', () => {
  let usecase: ImportOrdersFromFileUsecase;
  let datasource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CustomersModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Orders, Customers, OrderProducts, IntegrationControl],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([
          Orders,
          Customers,
          OrderProducts,
          IntegrationControl,
        ]),
      ],
      providers: [
        ImportOrdersFromFileUsecase,
        GetOrdersUsecase,
        {
          provide: 'Datasource',
          inject: [DataSource],
          useFactory: (datasource: DataSource) => {
            return datasource;
          },
        },
      ],
    }).compile();

    usecase = module.get<ImportOrdersFromFileUsecase>(
      ImportOrdersFromFileUsecase,
    );
    datasource = module.get<DataSource>('Datasource');

    await datasource.transaction(async (manager) => {
      await manager.delete(IntegrationControl, {});
      await manager.delete(Customers, {});
      await manager.delete(Orders, {});
      await manager.delete(OrderProducts, {});
    });
  });

  it('should be defined', async () => {
    expect(usecase).toBeDefined();
  });

  it('should import orders from file', async () => {
    const createOrdersPayload = {
      orders: [
        {
          userId: 1,
          name: 'Arthur Morgan',
          orderId: 1,
          prodId: 1,
          value: 1500,
          date: new Date(),
        },
        {
          userId: 2,
          name: 'Peter Parker',
          orderId: 2,
          prodId: 1,
          value: 1500,
          date: new Date(),
        },
        {
          userId: 3,
          name: 'Michael Corleone',
          orderId: 3,
          prodId: 1,
          value: 1500,
          date: new Date(),
        },
        {
          userId: 4,
          name: 'Barney Stinson',
          orderId: 4,
          prodId: 1,
          value: 1500,
          date: new Date(),
        },
      ],
    };
    await usecase.execute(createOrdersPayload);
    const orders = await datasource.getRepository(Orders).find();
    expect(orders).toHaveLength(4);
  });

  it('should throw an error if payload is in incorret format', async () => {
    const createOrdersPayload = {
      orders: [
        {
          userId: 1,
          name: 'Arthur Morgan',
          orderId: 1,
          prodId: 1,
          value: 1500,
          date: new Date(),
        },
      ],
    };
    const datasourceSpy = jest.spyOn(datasource, 'transaction');
    datasourceSpy.mockRejectedValueOnce(new Error('Erro ao importar arquivo'));
    expect(async () => {
      await usecase.execute(createOrdersPayload);
    }).rejects.toThrow(
      new UnprocessableEntityException('Erro ao importar arquivo'),
    );
  });
});
