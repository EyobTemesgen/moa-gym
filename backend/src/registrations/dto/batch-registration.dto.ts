import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRegistrationDto } from './create-registration.dto';

export class BatchRegistrationDto {
  @ApiProperty({ type: [CreateRegistrationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRegistrationDto)
  registrations: CreateRegistrationDto[];
}
