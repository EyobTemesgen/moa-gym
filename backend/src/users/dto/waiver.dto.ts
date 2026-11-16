import { IsBoolean, IsNotEmpty, IsObject, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParqResponsesDto {
  @ApiProperty({ description: 'Has doctor ever said you have a heart condition?' })
  @IsBoolean()
  chestPain: boolean;

  @ApiProperty({ description: 'Do you feel pain in chest when performing physical activity?' })
  @IsBoolean()
  chestPainActive: boolean;

  @ApiProperty({ description: 'Do you lose balance because of dizziness or ever lose consciousness?' })
  @IsBoolean()
  dizziness: boolean;

  @ApiProperty({ description: 'Do you have bone or joint problem that could be worsened?' })
  @IsBoolean()
  boneJointCondition: boolean;

  @ApiProperty({ description: 'Is doctor currently prescribing drugs for blood pressure or heart?' })
  @IsBoolean()
  bloodPressureHeartMeds: boolean;

  @ApiProperty({ description: 'Any recent surgery or medical condition requiring restriction?' })
  @IsBoolean()
  recentSurgery: boolean;

  @ApiProperty({ description: 'Any other reason why you should not do physical activity?' })
  @IsBoolean()
  otherReason: boolean;
}

export class SubmitWaiverDto {
  @ApiProperty({ description: 'PAR-Q responses object' })
  @IsObject()
  parqResponses: ParqResponsesDto;

  @ApiProperty({ description: 'Full name of emergency contact' })
  @IsNotEmpty()
  @IsString()
  emergencyContactName: string;

  @ApiProperty({ description: 'Phone number of emergency contact' })
  @IsNotEmpty()
  @IsString()
  emergencyContactPhone: string;

  @ApiProperty({ description: 'Confirmation that user agrees to terms' })
  @IsBoolean()
  agreedToTerms: boolean;
}
