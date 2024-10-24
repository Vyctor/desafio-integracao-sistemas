import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Customers } from '../../customers/entities/customer.entity';
import { CustomersRepository } from '../../customers/customers.repository';

export type GetOrdersUsecaseOutput = Array<{
  user_id: number;
  name: string;
  orders: Array<{
    order_id: number;
    total: string;
    date: string;
    products: Array<{
      product_id: number;
      value: string;
    }>;
  }>;
}>;

@Injectable()
export class GetOrdersUsecase {
  private readonly logger = new Logger(GetOrdersUsecase.name);

  constructor(private readonly customersRepository: CustomersRepository) {}

  public async execute(params?: {
    order_id?: number;
    min_date?: string;
    max_date?: string;
  }): Promise<Customers[]> {
    try {
      const ordersGroupedByCustomer =
        await this.customersRepository.findOrdersByCustomer(params);

      if (!ordersGroupedByCustomer.length) {
        throw new NotFoundException('Nenhum pedido encontrado');
      }

      return ordersGroupedByCustomer;
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
}
