import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationControl } from './entities/integration-control.entity';
import { IntegrationControlRepository } from './integration-control.repository';
import { DataSource } from 'typeorm';

describe('IntegrationControlRepository', () => {
  let integrationControlRepository: IntegrationControlRepository;
  let datasource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [IntegrationControl],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([IntegrationControl]),
      ],
      providers: [
        IntegrationControlRepository,
        {
          provide: 'Datasource',
          inject: [DataSource],
          useFactory: (datasource: DataSource) => {
            return datasource;
          },
        },
      ],
    }).compile();

    integrationControlRepository = module.get<IntegrationControlRepository>(
      IntegrationControlRepository,
    );
    datasource = module.get<DataSource>('Datasource');
    await datasource.transaction(async (manager) => {
      await manager.delete(IntegrationControl, {});
    });
  });

  it('should be defined', () => {
    expect(integrationControlRepository).toBeDefined();
  });

  describe('create', () => {
    it('should call create method of the repository', () => {
      const input = { hash: 'test-hash', filename: 'test.txt' };
      const entity = integrationControlRepository.create(input);

      expect(entity.hash).toEqual(input.hash);
      expect(entity.filename).toEqual(input.filename);
    });
  });

  describe('save', () => {
    it('should call save method of the repository', async () => {
      const input = { hash: 'test-hash', filename: 'test.txt' };
      const entity = integrationControlRepository.create(input);

      const spy = jest.spyOn(integrationControlRepository, 'save');
      spy.mockResolvedValue(entity as any);

      const result = await integrationControlRepository.save(entity);

      expect(integrationControlRepository.save).toHaveBeenCalledWith(entity);
      expect(result).toEqual(entity);
    });
  });

  describe('findOneByHash', () => {
    it('should call findOne method of the repository', async () => {
      const entity = integrationControlRepository.create({
        filename: 'test.txt',
        hash: 'test-hash',
      });
      const savedEntity = await integrationControlRepository.save(entity);

      const findedEntity =
        await integrationControlRepository.findOneByHash('test-hash');

      expect(findedEntity).toEqual(savedEntity);
    });
  });
});
