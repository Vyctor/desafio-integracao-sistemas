import { Customers } from '../entities/customer.entity';

export class OrderTransform {
  public static fromDbToApiResponse(ordersGroupedByCustomer: Customers[]) {
    return ordersGroupedByCustomer.map((customerWithOrder) => {
      return {
        user_id: customerWithOrder.id,
        name: customerWithOrder.name,
        orders: customerWithOrder.order.map((order) => {
          return {
            order_id: order.id,
            total: order.orderProducts
              .reduce(
                (acc, next) =>
                  acc + parseFloat(next.value as unknown as string),
                0,
              )
              .toFixed(2),
            date:
              order.date.getFullYear() +
              '-' +
              (order.date.getMonth() + 1) +
              '-' +
              order.date.getDate(),
            products: order.orderProducts.map((orderProduct) => {
              return {
                product_id: orderProduct.productId,
                value: orderProduct.value as unknown as string,
              };
            }),
          };
        }),
      };
    });
  }
}
