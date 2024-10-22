import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Customers } from '../entities/customer.entity';

@Injectable()
export class GetOrdersUsecase {
  private readonly logger = new Logger(GetOrdersUsecase.name);

  constructor(
    @InjectRepository(Customers)
    private readonly customersRepository: Repository<Customers>,
  ) {}

  public async execute(params: {
    order_id: number;
    min_date: string;
    max_date: string;
  }) {
    try {
      const customersWithOrders = await this.customersRepository.find({
        relations: ['order', 'order.orderProducts'],
        where: {
          order: {
            id: params.order_id ? params.order_id : null,
            date:
              params.min_date && params.max_date
                ? Between(new Date(params.min_date), new Date(params.max_date))
                : null,
          },
        },
        order: {
          order: {
            date: 'DESC',
          },
        },
      });

      if (!customersWithOrders.length) {
        throw new NotFoundException('Nenhum pedido encontrado');
      }

      return this.transforOrdersToApiFormat(customersWithOrders);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar os pedidos ${JSON.stringify({
          error,
          params,
        })}`,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Não foi possível buscar os pedidos',
      );
    }
  }

  private transforOrdersToApiFormat(customers: Customers[]): Array<{
    user_id: number;
    name: string;
    orders: Array<{
      order_id: number;
      total: number;
      date: Date;
      products: Array<{
        product_id: number;
        value: number;
      }>;
    }>;
  }> {
    return customers.map((customerWithOrder) => {
      return {
        user_id: customerWithOrder.id,
        name: customerWithOrder.name,
        orders: customerWithOrder.order.map((order) => {
          return {
            order_id: order.id,
            total: order.total,
            date: order.date,
            products: order.orderProducts.map((orderProduct) => {
              return {
                product_id: orderProduct.productId,
                value: orderProduct.value,
              };
            }),
          };
        }),
      };
    });
  }
}
