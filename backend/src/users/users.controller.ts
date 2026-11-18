import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SubmitWaiverDto } from './dto/waiver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, EmploymentStatus } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user profile, active check-in, and upcoming classes' })
  async getMyProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Post('me/waiver')
  @ApiOperation({ summary: 'Submit mandatory PAR-Q health screening & liability agreement' })
  async submitWaiver(@Req() req: any, @Body() dto: SubmitWaiverDto) {
    return this.usersService.submitWaiver(req.user.id, dto);
  }

  @Get('me/qr-pass')
  @ApiOperation({ summary: 'Generate short-lived rotating JWT entry pass for browser display' })
  async getRotatingQrPass(@Req() req: any) {
    return this.usersService.generateQrPassToken(req.user.id);
  }

  // --- Admin User Management Endpoints ---

  @Get('manage')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all system users with roles and status (Admin only)' })
  @ApiQuery({ name: 'query', required: false, description: 'Search by Name, Employee ID, Department, or Email' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'status', required: false, enum: EmploymentStatus })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listUsers(
    @Query('query') query?: string,
    @Query('role') role?: Role,
    @Query('status') status?: EmploymentStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.listUsers({
      query,
      role,
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user system role (Admin only)' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: Role,
    @Req() req: any,
  ) {
    return this.usersService.updateUserRole(id, role, req.user?.id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Activate or suspend user account (Admin only)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EmploymentStatus,
  ) {
    return this.usersService.updateUserStatus(id, status);
  }

  @Get('candidates')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get active employees list with existing user account status for Add User modal' })
  async getCandidates() {
    return this.usersService.getAddUserCandidates();
  }

  @Post(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reset user password to default Password123! (Admin only)' })
  async resetPassword(
    @Param('id') id: string,
    @Body('newPassword') newPassword?: string,
  ) {
    return this.usersService.resetUserPassword(id, newPassword);
  }

  @Post('provision')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add user account or assign role to employee (Admin only)' })
  async provisionUser(
    @Body('employeeId') employeeId: string,
    @Body('role') role: Role,
    @Body('password') password?: string,
  ) {
    return this.usersService.provisionUser(employeeId, role, password);
  }
}
