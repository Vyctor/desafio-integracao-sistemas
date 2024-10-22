import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  async process(@UploadedFile() file: Express.Multer.File) {
    return this.ordersService.saveOrders(
      this.ordersService.transformOrdersFileToJson(file),
    );
  }

  @Get()
  async getOrders(@Paginate() query: PaginateQuery) {
    return this.ordersService.getOrders(query);
  }
}
