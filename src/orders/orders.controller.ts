import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('orders')
export class OrdersController {
  constructor() {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  async process(@UploadedFile() file: Express.Multer.File) {
    const fileData = file.buffer.toString('utf-8').split('\n');
    console.log(fileData);

    const orders = fileData.map((line) => {
      const userId = parseInt(line.substring(0, 10).trim(), 10);
      const name = line.substring(10, 55).trim();
      const orderId = parseInt(line.substring(55, 65).trim(), 10);
      const prodId = parseInt(line.substring(65, 75).trim(), 10);
      const value = parseFloat(line.substring(75, 87).trim());
      const date = new Date(
        line
          .substring(87, 95)
          .trim()
          .replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
      );

      return { userId, name, orderId, prodId, value, date };
    });

    return orders;
  }
}
