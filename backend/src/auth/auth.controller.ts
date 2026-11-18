import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ClaimAccountDto } from './dto/claim-account.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterStaffDto } from './dto/register.dto';

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

  @Get('available-lockers')
  @ApiOperation({ summary: 'Public list of lockers and availability for self-serve registration' })
  async getAvailableLockers() {
    return this.authService.getAvailableLockers();
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Self-service registration for internal staff and external members' })
  @ApiResponse({ status: 201, description: 'Account and gym registration created, session started' })
  async register(@Body() registerDto: RegisterStaffDto) {
    return this.authService.register(registerDto);
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

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public self-service password change or reset from login portal' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async resetOrChangePassword(@Body() resetDto: ResetPasswordDto) {
    return this.authService.resetOrChangePassword(resetDto);
  }
}
