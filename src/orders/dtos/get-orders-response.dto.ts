import { ApiProperty } from '@nestjs/swagger';

export class OrderProductsResponseDto {
  @ApiProperty({ example: 4 })
  product_id: number;
  @ApiProperty({ example: '1963.51' })
  value: string;
}

export class OrdersResponseDto {
  @ApiProperty({
    example: 821,
  })
  order_id: number;
  @ApiProperty({
    example: '1963.51',
  })
  total: string;
  @ApiProperty({
    example: '2021-10-8',
  })
  date: string;
  @ApiProperty({ isArray: true, type: OrderProductsResponseDto })
  products: Array<OrderProductsResponseDto>;
}

export class GetOrdersResponseDto {
  @ApiProperty({ example: 87 })
  user_id: number;
  @ApiProperty({
    example: 'Tesha Quigley',
  })
  name: string;
  @ApiProperty({ isArray: true, type: OrdersResponseDto })
  orders: Array<OrdersResponseDto>;
}
