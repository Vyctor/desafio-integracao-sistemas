import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { DataSource } from 'typeorm';
import { IntegrationControl } from '../orders/entities/integration-control.entity';
import { ConflictException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('FilesService', () => {
  let service: FilesService;
  let dataSource: DataSource;

  const mockFile = {
    buffer: readFileSync(
      join(__dirname, '..', '..', '__tests__', 'files', 'unit_tests.txt'),
    ),
    originalname: 'unit_tests.txt',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
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

    service = module.get<FilesService>(FilesService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformOrdersFileToJson', () => {
    it('should transform a file to JSON', () => {
      const orders = service.transformOrdersFileToJson(mockFile as any);

      expect(orders).toEqual([
        {
          userId: 70,
          name: 'Palmer Prosacco',
          orderId: 753,
          prodId: 3,
          value: 1836.74,
          date: new Date('2021-03-08T00:00:00.000Z'),
        },
        {
          userId: 75,
          name: 'Bobbie Batz',
          orderId: 798,
          prodId: 2,
          value: 1578.57,
          date: new Date('2021-11-16T00:00:00.000Z'),
        },
        {
          userId: 49,
          name: 'Ken Wintheiser',
          orderId: 523,
          prodId: 3,
          value: 586.74,
          date: new Date('2021-09-03T00:00:00.000Z'),
        },
        {
          userId: 14,
          name: 'Clelia Hills',
          orderId: 146,
          prodId: 1,
          value: 673.49,
          date: new Date('2021-11-25T00:00:00.000Z'),
        },
      ]);
    });
  });

  describe('hashOrdersFile', () => {
    it('should hash a file', () => {
      const fileHash = service.hashOrdersFile(mockFile as any);
      expect(fileHash).toBeDefined();
    });
  });

  describe('getFileExtension', () => {
    it('should get the file extension', () => {
      const fileExtension = service.getFileExtension(mockFile as any);
      expect(fileExtension).toBe('txt');
    });
  });

  describe('validateIfFileAlreadyImported', () => {
    it('should throw a ConflictException if the file is already imported', async () => {
      const fileHash = 'test-hash';
      jest
        .spyOn(dataSource.getRepository(IntegrationControl), 'findOne')
        .mockResolvedValue({
          hash: fileHash,
          createdAt: new Date(),
          filename: 'orders.txt',
          id: 1,
        });

      await expect(
        service.validateIfFileAlreadyImported(fileHash),
      ).rejects.toThrowError(ConflictException);
    });

    it('should not throw an error if the file is not already imported', async () => {
      const fileHash = 'test-hash';
      jest
        .spyOn(dataSource.getRepository(IntegrationControl), 'findOne')
        .mockResolvedValue(null);

      await expect(
        service.validateIfFileAlreadyImported(fileHash),
      ).resolves.not.toThrow();
    });
  });
});
