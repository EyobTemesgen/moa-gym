import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current user password', example: 'Password123!' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'New password (min 8 characters, letters and numbers)', example: 'NewSecret123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}
