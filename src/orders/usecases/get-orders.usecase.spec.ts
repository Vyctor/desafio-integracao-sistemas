import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customers } from '../entities/customer.entity';
import { GetOrdersUsecase } from './get-orders.usecase';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

const mockCustomerRepository = () => ({
  find: jest.fn(),
});

describe('GetOrdersUsecase', () => {
  let getOrdersUsecase: GetOrdersUsecase;
  let customersRepository: Repository<Customers>;
  const mockParams = {
    order_id: 1,
    min_date: '2023-01-01',
    max_date: '2023-12-31',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOrdersUsecase,
        {
          provide: getRepositoryToken(Customers),
          useFactory: mockCustomerRepository,
        },
      ],
    }).compile();

    getOrdersUsecase = module.get<GetOrdersUsecase>(GetOrdersUsecase);
    customersRepository = module.get<Repository<Customers>>(
      getRepositoryToken(Customers),
    );
  });

  it('should be defined', () => {
    expect(getOrdersUsecase).toBeDefined();
  });

  it("should return orders when i search by order's id", async () => {
    const mockCustomers = [
      {
        id: 1,
        name: 'John Doe',
        order: [
          {
            id: 1,
            date: new Date('2023/01/01'),
            orderProducts: [
              { productId: 1, value: '100.00' },
              { productId: 2, value: '50.00' },
            ],
          },
        ],
      },
    ];

    customersRepository.find = jest.fn().mockResolvedValue(mockCustomers);

    const result = await getOrdersUsecase.execute({
      order_id: 2,
    });

    expect(result).toEqual([
      {
        user_id: 1,
        name: 'John Doe',
        orders: [
          {
            order_id: 1,
            total: '150.00',
            date: '2023-1-1',
            products: [
              { product_id: 1, value: '100.00' },
              { product_id: 2, value: '50.00' },
            ],
          },
        ],
      },
    ]);
  });

  it('should return all orders when i let the query params empty', async () => {
    const mockCustomers = [
      {
        id: 1,
        name: 'John Doe',
        order: [
          {
            id: 1,
            date: new Date('2023/01/01'),
            orderProducts: [
              { productId: 1, value: '100.00' },
              { productId: 2, value: '50.00' },
            ],
          },
          {
            id: 2,
            date: new Date('2023/01/01'),
            orderProducts: [
              { productId: 3, value: '100.00' },
              { productId: 4, value: '50.00' },
            ],
          },
        ],
      },
    ];

    customersRepository.find = jest.fn().mockResolvedValue(mockCustomers);

    const result = await getOrdersUsecase.execute();

    expect(result).toEqual([
      {
        user_id: 1,
        name: 'John Doe',
        orders: [
          {
            order_id: 1,
            total: '150.00',
            date: '2023-1-1',
            products: [
              { product_id: 1, value: '100.00' },
              { product_id: 2, value: '50.00' },
            ],
          },
          {
            order_id: 2,
            total: '150.00',
            date: '2023-1-1',
            products: [
              { product_id: 3, value: '100.00' },
              { product_id: 4, value: '50.00' },
            ],
          },
        ],
      },
    ]);
  });

  it('should return orders in the correct format', async () => {
    const mockCustomers = [
      {
        id: 1,
        name: 'John Doe',
        order: [
          {
            id: 1,
            date: new Date('2023/01/01'),
            orderProducts: [
              { productId: 1, value: '100.00' },
              { productId: 2, value: '50.00' },
            ],
          },
        ],
      },
    ];

    customersRepository.find = jest.fn().mockResolvedValue(mockCustomers);

    const result = await getOrdersUsecase.execute(mockParams);

    expect(result).toEqual([
      {
        user_id: 1,
        name: 'John Doe',
        orders: [
          {
            order_id: 1,
            total: '150.00',
            date: '2023-1-1',
            products: [
              { product_id: 1, value: '100.00' },
              { product_id: 2, value: '50.00' },
            ],
          },
        ],
      },
    ]);
  });

  it('should throw NotFoundException if no orders found', async () => {
    customersRepository.find = jest.fn().mockResolvedValue([]);

    await expect(getOrdersUsecase.execute(mockParams)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should log error and throw InternalServerErrorException on failure', async () => {
    customersRepository.find = jest
      .fn()
      .mockRejectedValue(new Error('Some error'));

    await expect(getOrdersUsecase.execute(mockParams)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
