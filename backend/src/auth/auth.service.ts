import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ClaimAccountDto } from './dto/claim-account.dto';
import { EmploymentStatus, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUserByIdentifier(identifier: string, pass: string) {
    const trimmed = identifier.trim();

    // Find either by exact employeeId or by email in hrRecord
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: trimmed },
          { hrRecord: { email: { equals: trimmed, mode: 'insensitive' } } },
        ],
      },
      include: {
        hrRecord: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Employee ID or password');
    }

    if (user.hrRecord.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new ForbiddenException('Access denied: Employee status is not active in HR records');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Employee ID or password');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUserByIdentifier(dto.identifier, dto.password);

    const payload = {
      sub: user.id,
      employeeId: user.employeeId,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        fullName: user.hrRecord.fullName,
        department: user.hrRecord.department,
        email: user.hrRecord.email,
        photoUrl: user.hrRecord.photoUrl,
        role: user.role,
        waiverSigned: user.waiverSigned,
      },
    };
  }

  async lookupRoster(employeeId: string) {
    const trimmed = employeeId.trim();
    const roster = await this.prisma.hrEmployeeRoster.findUnique({
      where: { employeeId: trimmed },
      include: {
        userAccount: {
          select: {
            id: true,
            role: true,
            waiverSigned: true,
          },
        },
      },
    });

    if (!roster) {
      throw new NotFoundException(`Employee ID "${trimmed}" not found in HR roster`);
    }

    return {
      employeeId: roster.employeeId,
      fullName: roster.fullName,
      department: roster.department,
      employmentStatus: roster.employmentStatus,
      isClaimed: !!roster.userAccount,
      waiverSigned: roster.userAccount?.waiverSigned ?? false,
    };
  }

  async claimAccount(dto: ClaimAccountDto) {
    const trimmedId = dto.employeeId.trim();

    const hrRecord = await this.prisma.hrEmployeeRoster.findUnique({
      where: { employeeId: trimmedId },
      include: { userAccount: true },
    });

    if (!hrRecord) {
      throw new NotFoundException(`Employee ID "${trimmedId}" is not present in the MoA HR staff roster`);
    }

    if (hrRecord.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new ForbiddenException(`Employee "${trimmedId}" has non-active status (${hrRecord.employmentStatus})`);
    }

    if (hrRecord.userAccount) {
      throw new ConflictException(`An account for employee "${trimmedId}" has already been claimed. Please log in.`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        employeeId: trimmedId,
        passwordHash: hashedPassword,
        role: Role.STAFF_MEMBER,
        waiverSigned: false,
      },
      include: {
        hrRecord: true,
      },
    });

    const payload = {
      sub: newUser.id,
      employeeId: newUser.employeeId,
      role: newUser.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        fullName: hrRecord.fullName,
        department: hrRecord.department,
        email: hrRecord.email,
        photoUrl: hrRecord.photoUrl,
        role: newUser.role,
        waiverSigned: newUser.waiverSigned,
      },
    };
  }
}
