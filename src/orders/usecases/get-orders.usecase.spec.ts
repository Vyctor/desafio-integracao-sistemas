import { Test, TestingModule } from '@nestjs/testing';
import { GetOrdersUsecase } from './get-orders.usecase';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CustomersRepository } from '../../customers/customers.repository';

const mockCustomerRepository = () => ({
  findOrdersByCustomer: jest.fn(),
});

describe('GetOrdersUsecase', () => {
  let getOrdersUsecase: GetOrdersUsecase;
  let customersRepository: CustomersRepository;
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
          provide: CustomersRepository,
          useFactory: mockCustomerRepository,
        },
      ],
    }).compile();

    getOrdersUsecase = module.get<GetOrdersUsecase>(GetOrdersUsecase);
    customersRepository = module.get<CustomersRepository>(CustomersRepository);
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

    customersRepository.findOrdersByCustomer = jest
      .fn()
      .mockResolvedValue(mockCustomers);

    const result = await getOrdersUsecase.execute({
      order_id: 2,
    });

    const expected = [
      {
        id: 1,
        name: 'John Doe',
        order: [
          {
            id: 1,
            date: new Date('2023-01-01T03:00:00.000Z'),
            orderProducts: [
              { productId: 1, value: '100.00' },
              { productId: 2, value: '50.00' },
            ],
          },
        ],
      },
    ];

    expect(result).toEqual(expected);
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

    customersRepository.findOrdersByCustomer = jest
      .fn()
      .mockResolvedValue(mockCustomers);

    const result = await getOrdersUsecase.execute();

    const expected = {
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
    };
    expect(result).toEqual([expected]);
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

    customersRepository.findOrdersByCustomer = jest
      .fn()
      .mockResolvedValue(mockCustomers);

    const result = await getOrdersUsecase.execute(mockParams);

    const expected = [
      {
        id: 1,
        name: 'John Doe',
        order: [
          {
            id: 1,
            date: new Date('2023-01-01T03:00:00.000Z'),
            orderProducts: [
              { productId: 1, value: '100.00' },
              { productId: 2, value: '50.00' },
            ],
          },
        ],
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should throw NotFoundException if no orders found', async () => {
    customersRepository.findOrdersByCustomer = jest.fn().mockResolvedValue([]);

    await expect(getOrdersUsecase.execute(mockParams)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should log error and throw InternalServerErrorException on failure', async () => {
    customersRepository.findOrdersByCustomer = jest
      .fn()
      .mockRejectedValue(new Error('Some error'));

    await expect(getOrdersUsecase.execute(mockParams)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
