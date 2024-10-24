import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { OrderProducts } from './entities/order-products.entity';
import { ImportOrdersFromFileUsecase } from './usecases/import-orders-from-file.usecase';
import { GetOrdersUsecase } from './usecases/get-orders.usecase';
import { IntegrationControl } from './entities/integration-control.entity';
import { FilesService } from './services/files.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    ConfigModule,
    CustomersModule,
    TypeOrmModule.forFeature([Orders, OrderProducts, IntegrationControl]),
  ],
  providers: [ImportOrdersFromFileUsecase, GetOrdersUsecase, FilesService],
  controllers: [OrdersController],
  exports: [],
})
export class OrdersModule {}
