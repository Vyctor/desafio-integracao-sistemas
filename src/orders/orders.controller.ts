import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportOrdersFromFileUsecase } from './usecases/import-orders-from-file.usecase';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly importOrdersFromFileUsecase: ImportOrdersFromFileUsecase,
  ) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async process(@UploadedFile() file: Express.Multer.File) {
    return this.importOrdersFromFileUsecase.execute(file);
  }
}
