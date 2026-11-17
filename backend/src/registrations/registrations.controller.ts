import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { BatchRegistrationDto } from './dto/batch-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Gym Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post()
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN, Role.STAFF_MEMBER)
  @ApiOperation({ summary: 'Register a staff member for MoA Gym Service' })
  async create(@Body() dto: CreateRegistrationDto, @Request() req: any) {
    const registeredBy = req.user?.fullName
      ? `${req.user.fullName} (${req.user.role})`
      : 'Front Desk Attendant';
    return this.registrationsService.create(dto, registeredBy);
  }

  @Post('batch')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'Batch register multiple staff members (e.g. from physical paper forms)' })
  async createBatch(@Body() dto: BatchRegistrationDto, @Request() req: any) {
    const registeredBy = req.user?.fullName
      ? `${req.user.fullName} (${req.user.role})`
      : 'Front Desk Attendant';
    return this.registrationsService.createBatch(dto, registeredBy);
  }

  @Get()
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN, Role.STAFF_MEMBER)
  @ApiOperation({ summary: 'List all registered gym members matching official paper roster' })
  @ApiQuery({ name: 'query', required: false, description: 'Search by Name, Employee ID, Directorate, or Phone' })
  @ApiQuery({ name: 'department', required: false, description: 'Filter by Directorate (የስራ ክፍል)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (ACTIVE, SUSPENDED, ALL)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('query') query?: string,
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.registrationsService.findAll({
      query,
      department,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 200,
    });
  }

  @Get('stats')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN, Role.STAFF_MEMBER)
  @ApiOperation({ summary: 'Get summary statistics of registered gym members' })
  async getStats() {
    return this.registrationsService.getStats();
  }

  @Get(':id')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'Get registration details for a specific member' })
  async findOne(@Param('id') id: string) {
    return this.registrationsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'Update gym registration membership status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED',
  ) {
    return this.registrationsService.updateStatus(id, status);
  }
}
