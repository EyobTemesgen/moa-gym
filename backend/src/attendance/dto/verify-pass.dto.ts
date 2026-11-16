import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPassDto {
  @ApiProperty({ description: 'Scanned rotating QR pass token', required: false })
  @IsOptional()
  @IsString()
  qrToken?: string;

  @ApiProperty({ description: 'Direct MoA Employee ID lookup fallback', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;
}

export class CheckInDto {
  @ApiProperty({ description: 'Employee ID to check in' })
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'Optional assigned locker number', required: false, example: 'L-04' })
  @IsOptional()
  @IsString()
  lockerNumber?: string;
}

export class CheckOutDto {
  @ApiProperty({ description: 'Attendance record ID, Employee ID, or User ID' })
  @IsString()
  identifier: string;
}
