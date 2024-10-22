import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetOrdersDto {
  @ApiProperty({
    required: false,
    type: Number,
    description: 'ID do pedido',
  })
  @IsNumber()
  @IsOptional()
  order_id?: number;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Data mínima para busca',
  })
  @IsString()
  @IsOptional()
  min_date?: string;

  @ApiProperty({
    required: false,
    type: String,
    description: 'Data máxima para busca',
  })
  @IsString()
  @IsOptional()
  max_date?: string;
}
