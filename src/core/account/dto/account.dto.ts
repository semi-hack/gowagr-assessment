import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class FundAccountDto {
  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 10000,
  })
  amount: number;
}
