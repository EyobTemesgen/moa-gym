import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('api/health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Application process is alive' })
  getLiveness(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({
      status: 'alive',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe checking database connectivity' })
  @ApiResponse({ status: 200, description: 'Application is ready to handle traffic' })
  @ApiResponse({ status: 503, description: 'Application database is unavailable' })
  async getReadiness(@Res() res: Response) {
    try {
      await this.prisma.hrEmployeeRoster.count();
      return res.status(HttpStatus.OK).json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'not_ready',
        database: 'unavailable',
        message: 'The application database is unreachable or initializing.',
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Overall system health and diagnostics' })
  @ApiResponse({ status: 200, description: 'System is healthy and database is connected' })
  @ApiResponse({ status: 503, description: 'System is unhealthy or database is unavailable' })
  async getHealth(@Res() res: Response) {
    try {
      await this.prisma.hrEmployeeRoster.count();
    } catch {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'unhealthy',
        database: 'unavailable',
        message: 'The application database is unavailable or has not been initialized.',
      });
    }

    return res.status(HttpStatus.OK).json({
      status: 'healthy',
      database: 'connected',
      system: 'MoA Staff Wellness & Fitness Management System',
      scope: 'Gate Terminal, Floor Occupancy, Member Passes, and Wellness Analytics',
      environment: process.env.APP_ENV || (process.env.NODE_ENV === 'production' ? 'prod' : 'dev'),
      version: process.env.APP_VERSION || '1.0.0',
      commit: process.env.APP_COMMIT || 'dev',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
}
