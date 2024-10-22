import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { OrderProducts } from './entities/order-products.entity';
import { ImportOrdersFromFileUsecase } from './usecases/import-orders-from-file.usecase';
import { GetOrdersUsecase } from './usecases/get-orders.usecase';
import { Customers } from './entities/customer.entity';
import { IntegrationControl } from './entities/integration-control.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Orders,
      OrderProducts,
      Customers,
      IntegrationControl,
    ]),
  ],
  providers: [ImportOrdersFromFileUsecase, GetOrdersUsecase],
  controllers: [OrdersController],
  exports: [],
})
export class OrdersModule {}
