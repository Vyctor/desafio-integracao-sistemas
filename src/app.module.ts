import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { OrdersController } from './orders/orders.controller';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [OrdersModule, ConfigModule],
  controllers: [OrdersController],
  providers: [],
})
export class AppModule {}
