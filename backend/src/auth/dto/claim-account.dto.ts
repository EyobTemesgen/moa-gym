import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimAccountDto {
  @ApiProperty({ description: 'Official MoA Employee ID', example: 'EMP-MOA-003' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'New account password (min 6 characters)', example: 'NewSecret123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
