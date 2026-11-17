import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ClaimAccountDto } from './dto/claim-account.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with Employee ID or email and password' })
  @ApiResponse({ status: 200, description: 'JWT Access token and user profile returned' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List all distinct MoA directorates from staff roster' })
  async getDepartments() {
    return this.authService.getDepartments();
  }

  @Get('lookup-by-name')
  @ApiOperation({ summary: 'Search active MoA staff by Full Name and optional Directorate' })
  async lookupByName(
    @Query('name') name: string,
    @Query('department') department?: string,
  ) {
    return this.authService.lookupByName(name, department);
  }

  @Get('lookup')
  @ApiOperation({ summary: 'Check Employee ID and Name eligibility against MoA HR roster' })
  async lookup(
    @Query('employeeId') employeeId: string,
    @Query('fullName') fullName?: string,
  ) {
    return this.authService.lookupRoster(employeeId, fullName);
  }

  @Post('claim')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Self-claim account using whitelisted Employee ID and set initial password' })
  @ApiResponse({ status: 201, description: 'Account claimed successfully, session started' })
  async claim(@Body() claimDto: ClaimAccountDto) {
    return this.authService.claimAccount(claimDto);
  }
}
