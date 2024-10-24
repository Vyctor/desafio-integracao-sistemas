import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { ImportOrdersFromFileUsecase } from './usecases/import-orders-from-file.usecase';
import { GetOrdersUsecase } from './usecases/get-orders.usecase';
import { FilesService } from '../commons/files.service';
import { UnprocessableEntityException } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import { GetOrdersDto } from './dtos/get-orders.dto';
import { OrderTransform } from './transforms/order.transform';
import { DataSource } from 'typeorm';

describe('OrdersController', () => {
  let controller: OrdersController;
  let importOrdersFromFileUsecase: ImportOrdersFromFileUsecase;
  let getOrdersUsecase: GetOrdersUsecase;
  let filesService: FilesService;
  let dataSource: DataSource;

  const mockFile = {
    buffer: readFileSync(
      join(__dirname, '..', '..', '__tests__', 'files', 'unit_tests.txt'),
    ), // Lê o arquivo na raiz do projeto
    originalname: 'unit_tests.txt',
  };

  const mockOrders = [
    {
      id: 16960,
      name: 'Nome 388',
      order: [
        {
          id: 431409120,
          date: new Date('2015-02-02T00:00:00.000Z'),
          orderProducts: [
            {
              id: 3075841,
              productId: 9784,
              value: '243.79',
            },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: ImportOrdersFromFileUsecase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetOrdersUsecase,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockOrders),
          },
        },
        {
          provide: FilesService,
          useValue: {
            getFileExtension: jest.fn().mockReturnValue('txt'),
            hashOrdersFile: jest.fn().mockReturnValue('test-hash'),
            validateIfFileAlreadyImported: jest.fn(),
            transformOrdersFileToJson: jest.fn().mockReturnValue(mockOrders),
            saveFileHash: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            getRepository: jest.fn().mockReturnValue({
              findOne: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    importOrdersFromFileUsecase = module.get(ImportOrdersFromFileUsecase);
    getOrdersUsecase = module.get(GetOrdersUsecase);
    filesService = module.get(FilesService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('process', () => {
    it('should import orders from file', async () => {
      jest
        .spyOn(filesService, 'validateIfFileAlreadyImported')
        .mockResolvedValue(undefined);

      const result = await controller.process(mockFile as unknown as any);

      expect(filesService.getFileExtension).toHaveBeenCalledWith(mockFile);
      expect(filesService.hashOrdersFile).toHaveBeenCalledWith(mockFile);
      expect(filesService.validateIfFileAlreadyImported).toHaveBeenCalledWith(
        'test-hash',
      );
      expect(filesService.transformOrdersFileToJson).toHaveBeenCalledWith(
        mockFile,
      );
      expect(importOrdersFromFileUsecase.execute).toHaveBeenCalledWith({
        orders: mockOrders,
      });
      expect(result).toEqual({ message: 'Importação realizada com sucesso' });
    });

    it('should throw an error if the file extension is invalid', async () => {
      jest.spyOn(filesService, 'getFileExtension').mockReturnValue('csv');

      await expect(
        controller.process(mockFile as unknown as any),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });

  describe('list', () => {
    it('should list orders', async () => {
      const queryParams: GetOrdersDto = {
        order_id: 1234567890,
        min_date: '2023-01-01',
        max_date: '2023-01-31',
      };

      const result = await controller.list(queryParams);

      expect(getOrdersUsecase.execute).toHaveBeenCalledWith({
        order_id: 1234567890,
        min_date: '2023-01-01',
        max_date: '2023-01-31',
      });
      expect(result).toEqual(
        OrderTransform.fromDbToApiResponse(mockOrders as any),
      );
    });
  });
});
