import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  employeeId: string;
  role: string;
  type?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'moa-gym-super-secret-jwt-key-2026-wellness',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'GYM_PASS') {
      // Pass tokens are for gate verification, not general API authentication
      throw new UnauthorizedException('Invalid token scope');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { hrRecord: true },
    });

    if (!user) {
      throw new UnauthorizedException('User account not found');
    }

    if (user.hrRecord.employmentStatus !== 'ACTIVE') {
      throw new UnauthorizedException('Employee is not active in HR records');
    }

    return user;
  }
}
