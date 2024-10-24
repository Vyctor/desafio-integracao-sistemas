import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepository } from './orders.repository';
import { Orders } from '../entities/order.entity';

describe('OrdersRepository', () => {
  let ordersRepository: OrdersRepository;
  let mockOrdersRepository: any;

  beforeEach(async () => {
    mockOrdersRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        {
          provide: 'OrdersRepository',
          useValue: mockOrdersRepository,
        },
      ],
    }).compile();

    ordersRepository = module.get<OrdersRepository>(OrdersRepository);
  });

  describe('create', () => {
    it('should create a new order', async () => {
      const params = {
        orderId: 123,
        date: new Date('2024-10-24'),
        customerId: 456,
      };
      const expectedOrder = new Orders();
      expectedOrder.id = params.orderId;
      expectedOrder.date = params.date;
      expectedOrder.customer = { id: params.customerId } as unknown as any;

      mockOrdersRepository.create.mockReturnValueOnce(expectedOrder);

      const createdOrder = await ordersRepository.create(params);

      expect(mockOrdersRepository.create).toHaveBeenCalledWith({
        customer: { id: params.customerId },
        id: params.orderId,
        date: params.date,
      });
      expect(createdOrder).toEqual(expectedOrder);
    });
  });

  describe('save', () => {
    it('should save the provided order', async () => {
      const existingOrder = new Orders();
      existingOrder.id = 1;
      existingOrder.date = new Date('2024-10-23');
      existingOrder.customer = { id: 789, name: 'abc', order: [] };

      mockOrdersRepository.save.mockReturnValueOnce(existingOrder);

      const savedOrder = await ordersRepository.save(existingOrder);

      expect(mockOrdersRepository.save).toHaveBeenCalledWith(existingOrder);
      expect(savedOrder).toEqual(existingOrder);
    });
  });
});
