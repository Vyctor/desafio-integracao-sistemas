import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './entities/order.entity';
import { OrderProducts } from './entities/order-products.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Orders, OrderProducts])],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [],
})
export class OrdersModule {}
