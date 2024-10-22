import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { OrdersController } from './orders/orders.controller';

@Module({
  imports: [OrdersModule],
  controllers: [OrdersController],
  providers: [],
})
export class AppModule {}
