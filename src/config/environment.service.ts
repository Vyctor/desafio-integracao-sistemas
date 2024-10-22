import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentService {
  constructor(private config: ConfigService) {}

  get NODE_ENV(): string {
    return this.config.get<string>('NODE_ENV');
  }

  get DB_TYPE(): string {
    return this.config.get<string>('DB_TYPE');
  }

  get DB_URL(): string {
    return this.config.get<string>('DB_URL');
  }

  get DB_PORT(): number {
    return this.config.get<number>('DB_PORT');
  }

  get DB_NAME(): string {
    return this.config.get<string>('DB_NAME');
  }

  get DB_USER(): string {
    return this.config.get<string>('DB_USER');
  }

  get DB_PASS(): string {
    return this.config.get<string>('DB_PASS');
  }
}
