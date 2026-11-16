import { IsNotEmpty, IsString, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ description: 'Class title (e.g. Morning Aerobics)' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Instructor name' })
  @IsNotEmpty()
  @IsString()
  instructorName: string;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: 'Start time (e.g. 06:30)' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End time (e.g. 07:30)' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ description: 'Participant capacity limit', example: 15 })
  @IsInt()
  @Min(1)
  capacity: number;
}

export class CreateEquipmentIssueDto {
  @ApiProperty({ description: 'Name of the gym apparatus/equipment' })
  @IsNotEmpty()
  @IsString()
  equipmentName: string;

  @ApiProperty({ description: 'Description of the defect or malfunction' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
