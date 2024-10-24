import { ConflictException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IntegrationControl } from 'src/orders/entities/integration-control.entity';

export type FileToJsonContent = Array<{
  userId: number;
  name: string;
  orderId: number;
  prodId: number;
  value: number;
  date: Date;
}>;

@Injectable()
export class FilesService {
  logger: any;
  constructor(
    @InjectDataSource()
    private readonly datasource: DataSource,
  ) {}

  public transformOrdersFileToJson(
    file: Express.Multer.File,
  ): FileToJsonContent {
    const fileData = file.buffer.toString('utf-8').split('\n');
    const orders = fileData.map((line, index) => {
      if (index === fileData.length - 1) {
        return;
      }
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
    orders.pop();
    return orders;
  }

  public hashOrdersFile(file: Express.Multer.File): string {
    const hash = createHash('sha256');
    hash.update(file.buffer);
    return hash.digest('hex');
  }

  public getFileExtension(file: Express.Multer.File): string {
    return file.originalname.split('.').pop();
  }

  public async validateIfFileAlreadyImported(fileHash: string): Promise<void> {
    const fileAlreadyImported = await this.datasource
      .getRepository(IntegrationControl)
      .findOne({
        where: {
          hash: fileHash,
        },
      });

    if (fileAlreadyImported) {
      const errorMessage = `Arquivo já importado na data de ${fileAlreadyImported.createdAt.toISOString()} com o nome de ${fileAlreadyImported.filename}`;

      this.logger.error(
        JSON.stringify({
          error: errorMessage,
          file: fileAlreadyImported,
        }),
      );
      throw new ConflictException(errorMessage);
    }
    this.logger.log('Arquivo não importado anteriormente');
  }
}