import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WellnessService } from './wellness.service';
import { CreateClassDto, CreateEquipmentIssueDto } from './dto/wellness.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, IssueStatus } from '@prisma/client';

@ApiTags('Wellness & Classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/wellness')
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  @Get('classes')
  @ApiOperation({ summary: 'List wellness and fitness group classes' })
  async getClasses(@Req() req: any, @Query('date') date?: string) {
    return this.wellnessService.getClasses(date, req.user?.id);
  }

  @Post('classes')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'Schedule a new wellness group session' })
  async createClass(@Body() dto: CreateClassDto) {
    return this.wellnessService.createClass(dto);
  }

  @Post('classes/:id/book')
  @ApiOperation({ summary: 'Book spot in a wellness class' })
  async bookClass(@Param('id') classId: string, @Req() req: any) {
    return this.wellnessService.bookClass(classId, req.user.id);
  }

  @Delete('classes/:id/book')
  @ApiOperation({ summary: 'Cancel booking for a wellness class' })
  async cancelBooking(@Param('id') classId: string, @Req() req: any) {
    return this.wellnessService.cancelBooking(classId, req.user.id);
  }

  @Patch('classes/:classId/attendance/:userId')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'Toggle attendance status for a booked participant' })
  async toggleAttendance(
    @Param('classId') classId: string,
    @Param('userId') attendeeUserId: string,
    @Body('attended') attended: boolean,
  ) {
    return this.wellnessService.toggleAttendance(classId, attendeeUserId, attended);
  }

  @Get('equipment-issues')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'List reported equipment defects and maintenance log' })
  async getIssues() {
    return this.wellnessService.getEquipmentIssues();
  }

  @Post('equipment-issues')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN, Role.STAFF_MEMBER)
  @ApiOperation({ summary: 'Report damaged or malfunctioning gym equipment' })
  async reportIssue(@Body() dto: CreateEquipmentIssueDto) {
    return this.wellnessService.reportEquipmentIssue(dto);
  }

  @Patch('equipment-issues/:id/status')
  @Roles(Role.GYM_ATTENDANT, Role.ADMIN)
  @ApiOperation({ summary: 'Update equipment repair status' })
  async updateIssueStatus(
    @Param('id') id: string,
    @Body('status') status: IssueStatus,
  ) {
    return this.wellnessService.updateIssueStatus(id, status);
  }
}
