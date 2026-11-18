import { IsNotEmpty, IsString, MinLength, IsOptional, IsEmail, IsArray, IsNumber, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterStaffDto {
  @ApiProperty({ description: 'Membership category: INTERNAL (MoA Staff) or EXTERNAL (Community / Partner)', example: 'INTERNAL' })
  @IsNotEmpty()
  @IsString()
  @IsIn(['INTERNAL', 'EXTERNAL'])
  memberType: 'INTERNAL' | 'EXTERNAL';

  @ApiProperty({ description: 'First Name', example: 'Eyob' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last Name', example: 'Temesgen' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Username or account handle', required: false, example: 'eyob-moa' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Official work or personal email', example: 'eyobatem@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'MoA Directorate / Department or External Organization', example: 'Agricultural Extension Directorate' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ description: 'External organization name if EXTERNAL member', required: false, example: 'UNDP Ethiopia / Private' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ description: 'MoA Employee ID or Kebele/National ID', required: false, example: 'EMP-MOA-007' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ description: 'Contact phone number', required: false, example: '0927847332' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Gender: MALE or FEMALE', required: false, example: 'MALE' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ description: 'Password (min 6 characters)', example: 'Secret123!' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Preferred workout shift (MORNING, EVENING, ANY)', required: false, example: 'MORNING' })
  @IsOptional()
  @IsString()
  shiftPreference?: string;

  @ApiProperty({ description: 'Number of workout days planned per week (2, 3, 4, 5, 6)', required: false, example: 3 })
  @IsOptional()
  @IsNumber()
  daysPerWeek?: number;

  @ApiProperty({ description: 'List of specific workout days planned (e.g. MON, WED, FRI)', required: false, example: ['MON', 'WED', 'FRI'] })
  @IsOptional()
  @IsArray()
  workoutDays?: string[];

  @ApiProperty({ description: 'Primary fitness goal', required: false, example: 'Cardio & Aerobics' })
  @IsOptional()
  @IsString()
  fitnessGoal?: string;

  @ApiProperty({ description: 'Requested locker number', required: false, example: 'L-04' })
  @IsOptional()
  @IsString()
  lockerNumber?: string;

  @ApiProperty({ description: 'Calculated monthly membership fee in ETB', required: false, example: 350 })
  @IsOptional()
  @IsNumber()
  monthlyFee?: number;

  @ApiProperty({ description: 'Preferred payment method (PAYROLL_DEDUCTION, TELEBIRR, CBE_BIRR, CASH_DESK)', required: false, example: 'PAYROLL_DEDUCTION' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ description: 'Emergency contact name', required: false })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @ApiProperty({ description: 'Emergency contact phone', required: false })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;
}
