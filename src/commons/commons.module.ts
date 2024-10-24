import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { IntegrationControlModule } from '../integration-control/integration-control.module';

@Module({
  imports: [IntegrationControlModule],
  providers: [FilesService],
  exports: [FilesService],
})
export class CommonsModule {}
