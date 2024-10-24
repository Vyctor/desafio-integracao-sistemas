import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customers } from './entities/customer.entity';
import { CustomersRepository } from './customers.repository';
import { Between, Repository } from 'typeorm';

describe('CustomersRepository', () => {
  let customersRepository: CustomersRepository;
  let customersRepositoryMock: Repository<Customers>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersRepository,
        {
          provide: getRepositoryToken(Customers),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    customersRepository = module.get<CustomersRepository>(CustomersRepository);
    customersRepositoryMock = module.get<Repository<Customers>>(
      getRepositoryToken(Customers),
    );
  });

  it('should be defined', () => {
    expect(customersRepository).toBeDefined();
  });

  describe('findOrdersByCustomer', () => {
    it('should find orders by customer id', async () => {
      const mockCustomer = {
        id: 1,
        order: [
          {
            id: 10,
            date: new Date('2023-04-01'),
            orderProducts: [{ id: 1, product: {} }],
          },
        ],
      };
      const customersRepositorySpy = jest.spyOn(
        customersRepositoryMock,
        'find',
      );
      customersRepositorySpy.mockResolvedValue([
        mockCustomer,
      ] as unknown as any);

      const result = await customersRepository.findOrdersByCustomer({
        order_id: 10,
      });

      expect(customersRepositoryMock.find).toHaveBeenCalledWith({
        relations: ['order', 'order.orderProducts'],
        where: {
          order: {
            id: 10,
            date: null,
          },
        },
        order: {
          order: {
            date: 'DESC',
          },
        },
      });

      expect(result).toEqual([mockCustomer]);
    });

    it('should find orders by date range', async () => {
      const mockCustomer = {
        id: 1,
        order: [
          {
            id: 10,
            date: new Date('2023-04-02'),
            orderProducts: [{ id: 1, product: {} }],
          },
          {
            id: 11,
            date: new Date('2023-04-03'),
            orderProducts: [{ id: 2, product: {} }],
          },
        ],
      };
      const customersRepositorySpy = jest.spyOn(
        customersRepositoryMock,
        'find',
      );
      customersRepositorySpy.mockResolvedValue([
        mockCustomer,
      ] as unknown as any);

      const result = await customersRepository.findOrdersByCustomer({
        min_date: '2023-04-01',
        max_date: '2023-04-04',
      });

      expect(customersRepositoryMock.find).toHaveBeenCalledWith({
        relations: ['order', 'order.orderProducts'],
        where: {
          order: {
            id: null,
            date: Between(new Date('2023-04-01'), new Date('2023-04-04')),
          },
        },
        order: {
          order: {
            date: 'DESC',
          },
        },
      });

      expect(result).toEqual([mockCustomer]);
    });

    it('should find orders by customer id and date range', async () => {
      const mockCustomer = {
        id: 1,
        order: [
          {
            id: 10,
            date: new Date('2023-04-02'),
            orderProducts: [{ id: 1, product: {} }],
          },
        ],
      };

      const customersRepositorySpy = jest.spyOn(
        customersRepositoryMock,
        'find',
      );

      customersRepositorySpy.mockResolvedValue([
        mockCustomer,
      ] as unknown as any);

      const result = await customersRepository.findOrdersByCustomer({
        order_id: 10,
        min_date: '2023-04-01',
        max_date: '2023-04-04',
      });

      expect(customersRepositoryMock.find).toHaveBeenCalledWith({
        relations: ['order', 'order.orderProducts'],
        where: {
          order: {
            id: 10,
            date: Between(new Date('2023-04-01'), new Date('2023-04-04')),
          },
        },
        order: {
          order: {
            date: 'DESC',
          },
        },
      });

      expect(result).toEqual([mockCustomer]);
    });
  });
});
