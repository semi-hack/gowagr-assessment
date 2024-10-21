import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FundAccountDto {
  @IsNumber()
  @ApiProperty({
    example: 10000,
  })
  amount: number;
}
