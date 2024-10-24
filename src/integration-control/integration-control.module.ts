import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationControl } from './entities/integration-control.entity';
import { IntegrationControlRepository } from './integration-control.repository';

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationControl])],
  providers: [IntegrationControlRepository],
  exports: [IntegrationControlRepository],
})
export class IntegrationControlModule {}
