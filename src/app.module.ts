import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentService } from './config/environment.service';
import { CustomersModule } from './customers/customers.module';
import { IntegrationControlModule } from './integration-control/integration-control.module';
import { CommonsModule } from './commons/commons.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [EnvironmentService],
      useFactory: (environmentService: EnvironmentService) => ({
        type: environmentService.DB_TYPE as any,
        host: environmentService.DB_URL,
        port: environmentService.DB_PORT,
        database: environmentService.DB_NAME,
        username: environmentService.DB_USER,
        password: environmentService.DB_PASS,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        pool: {
          max: 20,
          min: 10,
          acquire: 30000,
          idle: 10000,
        },
      }),
    }),
    OrdersModule,
    CustomersModule,
    IntegrationControlModule,
    CommonsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
