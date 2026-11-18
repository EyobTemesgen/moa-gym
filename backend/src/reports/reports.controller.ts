import { Controller, Get, Patch, Query, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @Roles(Role.ADMIN, Role.GYM_ATTENDANT)
  @ApiOperation({ summary: 'Aggregated gym utilization metrics, peak hours, and directorate breakdown' })
  async getAnalytics(@Query('days') days?: string) {
    return this.reportsService.getAnalytics(days ? parseInt(days, 10) : 30);
  }

  @Get('attendance-logs')
  @Roles(Role.ADMIN, Role.GYM_ATTENDANT)
  @ApiOperation({ summary: 'List paginated attendance logs with filters' })
  @ApiQuery({ name: 'query', required: false, description: 'Search by staff name, employee ID, or locker' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by Directorate' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by session status (ALL, ACTIVE, COMPLETED, AUTO_CLOSED)' })
  @ApiQuery({ name: 'days', required: false, description: 'Days back to inspect' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAttendanceLogs(
    @Query('query') query?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('days') days?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportsService.getAttendanceLogs({
      query,
      department,
      status,
      days: days ? parseInt(days, 10) : 30,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('export-csv')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update gym max capacity and liability waiver contract text' })
  async updateConfig(
    @Body('maxCapacity') maxCapacity?: number,
    @Body('waiverText') waiverText?: string,
  ) {
    return this.reportsService.updateConfig({ maxCapacity, waiverText });
  }
}
