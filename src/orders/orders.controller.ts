import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImportOrdersFromFileUsecase } from './usecases/import-orders-from-file.usecase';
import { GetOrdersUsecase } from './usecases/get-orders.usecase';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly importOrdersFromFileUsecase: ImportOrdersFromFileUsecase,
    private readonly getOrdersUsecase: GetOrdersUsecase,
  ) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async process(@UploadedFile() file: Express.Multer.File) {
    return this.importOrdersFromFileUsecase.execute(file);
  }

  @Get()
  async list(
    @Query('order_id') order_id?: number,
    @Query('min_date') min_date?: string,
    @Query('max_date') max_date?: string,
  ) {
    return this.getOrdersUsecase.execute({
      order_id,
      min_date,
      max_date,
    });
  }
}
