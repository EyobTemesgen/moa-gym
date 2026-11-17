import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: 'EMP-MOA-102', description: 'MoA Employee ID' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'መሰረት መብራቴ (Meseret Mebrate)', description: 'Full Name (Amharic/English)' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'ምግብ ዋስትና (Food Security)', description: 'Directorate / Work Unit (የስራ ክፍል)' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: '+251 91 123 4567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'meseret.m@moa.gov.et', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'data:image/jpeg;base64,...', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 'FEMALE', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: 'EVENING', required: false })
  @IsOptional()
  @IsString()
  shiftPreference?: string;

  @ApiProperty({ example: 'FRONT_DESK', required: false })
  @IsOptional()
  @IsString()
  registrationSource?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  signatureConfirmed?: boolean;

  @ApiProperty({ example: 'data:image/png;base64,...', required: false })
  @IsOptional()
  @IsString()
  signatureData?: string;

  @ApiProperty({ example: 'Has physical medical clearance', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
