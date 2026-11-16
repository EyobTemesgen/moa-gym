import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SubmitWaiverDto } from './dto/waiver.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
