import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegrationControl } from './entities/integration-control.entity';
import { Repository } from 'typeorm';

@Injectable()
export class IntegrationControlRepository {
  constructor(
    @InjectRepository(IntegrationControl)
    private readonly integrationControlRepository: Repository<IntegrationControl>,
  ) {}

  create(input: { hash: string; filename: string }) {
    return this.integrationControlRepository.create(input);
  }

  async save(
    integrationControl: IntegrationControl,
  ): Promise<IntegrationControl> {
    return this.integrationControlRepository.save(integrationControl);
  }

  async findOneByHash(hash: string): Promise<IntegrationControl> {
    return this.integrationControlRepository.findOne({
      where: {
        hash,
      },
    });
  }
}
