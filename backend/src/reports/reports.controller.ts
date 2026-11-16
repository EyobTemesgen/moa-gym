import { Controller, Get, Patch, Query, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reports & System Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('analytics')
  @Roles(Role.HR_ADMIN, Role.GYM_ATTENDANT)
  @ApiOperation({ summary: 'Aggregated gym utilization metrics, peak hours, and directorate breakdown' })
  async getAnalytics(@Query('days') days?: string) {
    return this.reportsService.getAnalytics(days ? parseInt(days, 10) : 30);
  }

  @Get('export-csv')
  @Roles(Role.HR_ADMIN)
  @ApiOperation({ summary: 'Export attendance logs as a downloaded CSV file' })
  async exportCsv(@Res() res: Response, @Query('days') days?: string) {
    const csvData = await this.reportsService.generateAttendanceCsv(days ? parseInt(days, 10) : 30);
    const filename = `moa-gym-attendance-${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvData);
  }

  @Get('config')
  @ApiOperation({ summary: 'Get institutional gym configuration (capacity limit, waiver text)' })
  async getConfig() {
    return this.reportsService.getConfig();
  }

  @Patch('config')
  @Roles(Role.HR_ADMIN)
  @ApiOperation({ summary: 'Update gym max capacity and liability waiver contract text' })
  async updateConfig(
    @Body('maxCapacity') maxCapacity?: number,
    @Body('waiverText') waiverText?: string,
  ) {
    return this.reportsService.updateConfig({ maxCapacity, waiverText });
  }
}
