import { Test, TestingModule } from '@nestjs/testing';
import { OrderProductsRepository } from './order-products.repository';
import { OrderProducts } from '../entities/order-products.entity';

describe('OrderProductsRepository', () => {
  let orderProductsRepository: OrderProductsRepository;
  let mockOrderProductsRepository: any;

  beforeEach(async () => {
    mockOrderProductsRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderProductsRepository,
        {
          provide: 'OrderProductsRepository',
          useValue: mockOrderProductsRepository,
        },
      ],
    }).compile();

    orderProductsRepository = module.get<OrderProductsRepository>(
      OrderProductsRepository,
    );
  });

  describe('create', () => {
    it('should create a new order product association', async () => {
      const params = {
        productId: 123,
        value: 45.67,
        orderId: 789,
      };
      const expectedOrderProduct = new OrderProducts();
      expectedOrderProduct.productId = params.productId;
      expectedOrderProduct.value = parseFloat(params.value.toFixed(2));
      expectedOrderProduct.order = { id: params.orderId } as unknown as any;

      mockOrderProductsRepository.create.mockReturnValueOnce(
        expectedOrderProduct,
      );

      const createdOrderProduct = await orderProductsRepository.create(params);

      expect(mockOrderProductsRepository.create).toHaveBeenCalledWith({
        productId: params.productId,
        value: expectedOrderProduct.value,
        order: { id: params.orderId },
      });
      expect(createdOrderProduct).toEqual(expectedOrderProduct);
    });
  });

  describe('save', () => {
    it('should save the provided order product association', async () => {
      const existingOrderProduct = new OrderProducts();
      existingOrderProduct.id = 1;
      existingOrderProduct.productId = 456;
      existingOrderProduct.value = 123.45;
      existingOrderProduct.order = { id: 789 } as unknown as any;

      mockOrderProductsRepository.save.mockReturnValueOnce(
        existingOrderProduct,
      );

      const savedOrderProduct =
        await orderProductsRepository.save(existingOrderProduct);

      expect(mockOrderProductsRepository.save).toHaveBeenCalledWith(
        existingOrderProduct,
      );
      expect(savedOrderProduct).toEqual(existingOrderProduct);
    });
  });
});
