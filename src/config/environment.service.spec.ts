import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  let service: EnvironmentService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvironmentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnvironmentService>(EnvironmentService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get NODE_ENV', () => {
    it('should return the value from config service', () => {
      const expectedValue = 'development';
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.NODE_ENV).toBe(expectedValue);
    });
  });

  describe('get DB_TYPE', () => {
    it('should return the value from config service', () => {
      const expectedValue = 'postgres';
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.DB_TYPE).toBe(expectedValue);
    });
  });

  describe('get DB_URL', () => {
    it('should return the value from config service', () => {
      const expectedValue = 'postgres://user:password@host:port/database';
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.DB_URL).toBe(expectedValue);
    });
  });

  describe('get DB_PORT', () => {
    it('should return the value from config service', () => {
      const expectedValue = 5432;
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.DB_PORT).toBe(expectedValue);
    });
  });

  describe('get DB_NAME', () => {
    it('should return the value from config service', () => {
      const expectedValue = 'my_database';
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.DB_NAME).toBe(expectedValue);
    });
  });

  describe('get DB_USER', () => {
    it('should return the value from config service', () => {
      const expectedValue = 'my_user';
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.DB_USER).toBe(expectedValue);
    });
  });

  describe('get DB_PASS', () => {
    it('should return the value from config service', () => {
      const expectedValue = 'my_password';
      (configService.get as jest.Mock).mockReturnValue(expectedValue);

      expect(service.DB_PASS).toBe(expectedValue);
    });
  });
});
