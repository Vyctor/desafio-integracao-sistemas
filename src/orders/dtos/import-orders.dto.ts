import { ApiProperty } from '@nestjs/swagger';

export class ImportOrdersDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
}
