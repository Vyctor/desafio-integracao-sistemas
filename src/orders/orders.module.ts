import { OrdersRepository } from './repositories/orders.repository';
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { OrderProducts } from './entities/order-products.entity';
import { ImportOrdersFromFileUsecase } from './usecases/import-orders-from-file.usecase';
import { GetOrdersUsecase } from './usecases/get-orders.usecase';
import { CustomersModule } from '../customers/customers.module';
import { CommonsModule } from '../commons/commons.module';
import { OrderProductsRepository } from './repositories/order-products.repository';

@Module({
  imports: [
    ConfigModule,
    CustomersModule,
    CommonsModule,
    TypeOrmModule.forFeature([Orders, OrderProducts]),
  ],
  providers: [
    OrdersRepository,
    OrderProductsRepository,
    ImportOrdersFromFileUsecase,
    GetOrdersUsecase,
  ],
  controllers: [OrdersController],
  exports: [],
})
export class OrdersModule {}
