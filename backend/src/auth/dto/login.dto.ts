import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Employee ID or registered work email', example: 'EMP-ADM-01' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Account password', example: 'Password123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
