import { createHash } from 'crypto';

export type FileToJsonContent = Array<{
  userId: number;
  name: string;
  orderId: number;
  prodId: number;
  value: number;
  date: Date;
}>;

export class FilesService {
  static transformOrdersFileToJson(
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

  static hashOrdersFile(file: Express.Multer.File): string {
    const hash = createHash('sha256');
    hash.update(file.buffer);
    return hash.digest('hex');
  }

  static getFileExtension(file: Express.Multer.File): string {
    return file.originalname.split('.').pop();
  }
}
