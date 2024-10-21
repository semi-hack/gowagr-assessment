import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @ApiProperty({
    example: 'jd',
  })
  username: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'password',
  })
  password: string;
}
