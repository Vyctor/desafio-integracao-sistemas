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
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetOrdersDto } from './dtos/get-orders.dto';
import { ImportOrdersDto } from './dtos/import-orders.dto';
import { GetOrdersResponseDto } from './dtos/get-orders-response.dto';

@Controller('orders')
@ApiTags('orders')
export class OrdersController {
  constructor(
    private readonly importOrdersFromFileUsecase: ImportOrdersFromFileUsecase,
    private readonly getOrdersUsecase: GetOrdersUsecase,
  ) {}

  @Post('import')
  @ApiResponse({ status: 201, description: 'Importação realizada com sucesso' })
  @ApiResponse({
    status: 422,
    description: 'Erro ao importar arquivo | Formato de arquivo inválido',
  })
  @ApiResponse({ status: 409, description: 'Arquivo já importado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo de pedidos em formato .txt',
    type: ImportOrdersDto,
    required: true,
  })
  @UseInterceptors(FileInterceptor('file'))
  async process(@UploadedFile() file: Express.Multer.File) {
    await this.importOrdersFromFileUsecase.execute(file);
    return {
      message: 'Importação realizada com sucesso',
    };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Listagem de pedidos realizada com sucesso',
    type: GetOrdersResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum pedido encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Exception',
  })
  async list(
    @Query()
    queryParams: GetOrdersDto,
  ) {
    const { order_id, min_date, max_date } = queryParams;

    return this.getOrdersUsecase.execute({
      order_id,
      min_date,
      max_date,
    });
  }
}
