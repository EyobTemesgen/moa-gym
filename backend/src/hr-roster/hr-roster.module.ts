import { Module } from '@nestjs/common';
import { HrRosterService } from './hr-roster.service';
import { HrRosterController } from './hr-roster.controller';

@Module({
  controllers: [HrRosterController],
  providers: [HrRosterService],
  exports: [HrRosterService],
})
export class HrRosterModule {}
