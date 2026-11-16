import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { VerifyPassDto, CheckInDto, CheckOutDto } from './dto/verify-pass.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Attendance & Gate Access')
@Controller('api/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('occupancy')
  @ApiOperation({ summary: 'Get current real-time gym floor occupancy and capacity utilization' })
  async getOccupancy() {
    return this.attendanceService.getOccupancy();
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GYM_ATTENDANT, Role.HR_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Execute 6-step automated gate entrance check (QR pass or Employee ID)' })
  async verify(@Body() dto: VerifyPassDto) {
    return this.attendanceService.verifyEntrance(dto);
  }

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GYM_ATTENDANT, Role.HR_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authorize entrance and assign optional daily locker' })
  async checkIn(@Req() req: any, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(dto, req.user?.id);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.GYM_ATTENDANT, Role.HR_ADMIN, Role.STAFF_MEMBER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record checkout and automatically release assigned locker' })
  async checkOut(@Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(dto);
  }
}
