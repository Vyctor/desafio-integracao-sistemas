import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { IntegrationControlRepository } from '../integration-control/integration-control.repository';
import { ConflictException } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';

describe('FilesService', () => {
  let service: FilesService;
  let integrationControlRepository: IntegrationControlRepository;

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
          provide: IntegrationControlRepository,
          useValue: {
            findOneByHash: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    integrationControlRepository = module.get<IntegrationControlRepository>(
      IntegrationControlRepository,
    );
  });

  it('should transformOrdersFileToJson correctly', () => {
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

  it('should hashOrdersFile correctly', () => {
    const fileHash = service.hashOrdersFile(mockFile as any);

    expect(fileHash).toBe(
      '5b22821b6f0e192fb650cc7166878ba51c5dba4dc500c3bada2dc763eae1adba',
    );
  });

  it('should getFileExtension correctly', () => {
    const fileExtension = service.getFileExtension(mockFile as any);

    expect(fileExtension).toBe('txt');
  });

  it('should validateIfFileAlreadyImported correctly', async () => {
    const fileHash = 'test-hash';
    const mockFileAlreadyImported = {
      hash: fileHash,
      filename: 'orders.txt',
      createdAt: new Date(),
    };

    jest
      .spyOn(integrationControlRepository, 'findOneByHash')
      .mockResolvedValue(mockFileAlreadyImported as any);

    await expect(
      service.validateIfFileAlreadyImported(fileHash),
    ).rejects.toThrow(ConflictException);

    expect(integrationControlRepository.findOneByHash).toHaveBeenCalledWith(
      fileHash,
    );
  });

  it('should saveFileHash correctly', async () => {
    const fileHash = 'test-hash';
    const filename = 'orders.txt';
    const mockIntegrationControl = {
      hash: fileHash,
      filename,
    };

    jest
      .spyOn(integrationControlRepository, 'create')
      .mockReturnValue(mockIntegrationControl as any);

    await service.saveFileHash(fileHash, filename);

    expect(integrationControlRepository.create).toHaveBeenCalledWith({
      hash: fileHash,
      filename,
    });
    expect(integrationControlRepository.save).toHaveBeenCalledWith(
      mockIntegrationControl,
    );
  });
});
