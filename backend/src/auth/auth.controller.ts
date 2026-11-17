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
