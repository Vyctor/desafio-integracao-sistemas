import { Customers } from '../entities/customer.entity';
import { OrderTransform } from './order.transform';

describe('OrderTransform unit tests', () => {
  const payload = [
    {
      id: 16960,
      name: 'Nome 388',
      order: [
        {
          id: 431409120,
          date: new Date('2015-02-02T00:00:00.000Z'),
          orderProducts: [
            {
              id: 3075841,
              productId: 9784,
              value: '243.79',
            },
          ],
        },
      ],
    },
  ];

  it("should convert the order's date to the correct format", () => {
    const result = OrderTransform.fromDbToApiResponse(
      payload as unknown as Customers[],
    );

    console.log(JSON.stringify(result));
    expect(result).toEqual([
      {
        name: 'Nome 388',
        orders: [
          {
            date: '2015-2-1',
            order_id: 431409120,
            products: [{ product_id: 9784, value: '243.79' }],
            total: '243.79',
          },
        ],
        user_id: 16960,
      },
    ]);
  });
});
