import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LockersService } from './lockers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, LockerStatus } from '@prisma/client';

@ApiTags('Lockers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/lockers')
export class LockersController {
  constructor(private readonly lockersService: LockersService) {}

  @Get()
  @Roles(Role.GYM_ATTENDANT, Role.HR_ADMIN, Role.STAFF_MEMBER)
  @ApiOperation({ summary: 'Get current real-time locker availability grid' })
  async findAll() {
    return this.lockersService.findAll();
  }

  @Patch(':lockerNumber/status')
  @Roles(Role.GYM_ATTENDANT, Role.HR_ADMIN)
  @ApiOperation({ summary: 'Update locker maintenance status' })
  async updateStatus(
    @Param('lockerNumber') lockerNumber: string,
    @Body('status') status: LockerStatus,
  ) {
    return this.lockersService.updateStatus(lockerNumber, status);
  }

  @Post(':lockerNumber/release')
  @Roles(Role.GYM_ATTENDANT, Role.HR_ADMIN)
  @ApiOperation({ summary: 'Manually free / clear an occupied locker' })
  async release(@Param('lockerNumber') lockerNumber: string) {
    return this.lockersService.forceRelease(lockerNumber);
  }
}
