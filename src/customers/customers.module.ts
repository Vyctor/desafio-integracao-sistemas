import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customers } from './entities/customer.entity';
import { CustomersRepository } from './customers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customers])],
  providers: [CustomersRepository],
  exports: [CustomersRepository],
})
export class CustomersModule {}
