import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = unknown> {
  @ApiProperty({ example: 'Success' })
  message!: string;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty()
  data!: T;

  @ApiProperty({ example: '2026-08-06T11:50:00.000Z' })
  timestamp!: string;
}
