import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";


export class InitiateTransferDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @ApiProperty({
      example: 10,
    })
    amount: number;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
      example: 'jaden',
    })
    receiver: string;
  }
  