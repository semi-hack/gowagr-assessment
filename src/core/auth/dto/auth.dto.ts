import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @ApiProperty({
    example: 'jaden',
})
  username: string;

  @IsString()
  @ApiProperty({
    example: 'password'
  })
  password: string;
}
