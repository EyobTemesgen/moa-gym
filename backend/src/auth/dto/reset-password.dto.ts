import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Employee ID or registered work email', example: 'EMP-MOA-001' })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'Current or temporary password (optional if email verification is used)',
    required: false,
    example: 'Password123!',
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    description: 'Registered work email for identity verification if current password is forgotten',
    required: false,
    example: 'dawit.y@moa.gov.et',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: 'New password (min 6 characters)', example: 'NewSecret123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
