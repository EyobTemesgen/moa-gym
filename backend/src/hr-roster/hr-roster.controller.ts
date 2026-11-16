import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HrRosterService } from './hr-roster.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, EmploymentStatus } from '@prisma/client';

@ApiTags('HR Roster')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/hr-roster')
export class HrRosterController {
  constructor(private readonly hrRosterService: HrRosterService) {}

  @Post('upload')
  @Roles(Role.HR_ADMIN)
  @ApiOperation({ summary: 'Bulk upload / synchronize MoA employee roster from CSV' })
  async uploadCsv(@Body('csvContent') csvContent: string) {
    if (!csvContent) {
      throw new BadRequestException('csvContent string is required');
    }
    return this.hrRosterService.parseAndUpsertCsv(csvContent);
  }

  @Get()
  @Roles(Role.HR_ADMIN, Role.GYM_ATTENDANT)
  @ApiOperation({ summary: 'Get paginated employee eligibility roster' })
  async findAll(
    @Query('query') query?: string,
    @Query('department') department?: string,
    @Query('status') status?: EmploymentStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.hrRosterService.findAll({
      query,
      department,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get('departments')
  @Roles(Role.HR_ADMIN, Role.GYM_ATTENDANT)
  @ApiOperation({ summary: 'Get list of unique directorates / departments' })
  async getDepartments() {
    return this.hrRosterService.getDepartments();
  }

  @Patch(':employeeId/status')
  @Roles(Role.HR_ADMIN)
  @ApiOperation({ summary: 'Activate or suspend employee gym access status' })
  async updateStatus(
    @Param('employeeId') employeeId: string,
    @Body('status') status: EmploymentStatus,
  ) {
    if (!status) {
      throw new BadRequestException('status field is required');
    }
    return this.hrRosterService.updateStatus(employeeId, status);
  }
}
