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

function cleanTokens(str: string): string[] {
  if (!str) return [];
  const titles = /^(dr|ato|wro|w\/ro|w\/t|wt|eng|engineer)\.?\s+/i;
  const cleaned = str.replace(titles, '').toLowerCase();
  return cleaned
    .replace(/[^a-z0-9\u1200-\u137F\s]/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1,
        );
      }
    }
  }
  return dp[m][n];
}

function tokenMatches(candidateToken: string, officialToken: string): boolean {
  if (candidateToken === officialToken) return true;
  if (candidateToken.length >= 4 && officialToken.startsWith(candidateToken)) return true;
  if (officialToken.length >= 4 && candidateToken.startsWith(officialToken)) return true;
  if (Math.abs(candidateToken.length - officialToken.length) <= 1 && candidateToken.length >= 4) {
    if (levenshteinDistance(candidateToken, officialToken) <= 1) return true;
  }
  return false;
}

export function isNameMatching(officialName: string, candidateName: string): boolean {
  const official = cleanTokens(officialName);
  const candidate = cleanTokens(candidateName);

  if (candidate.length === 0 || official.length === 0) {
    return false;
  }

  // Exact phrase match
  if (official.join(' ') === candidate.join(' ')) {
    return true;
  }

  // Single name entered: check if it matches first name or any official token
  if (candidate.length === 1) {
    return official.some((tok) => tokenMatches(candidate[0], tok));
  }

  // First name and father's name match
  const firstMatches = tokenMatches(candidate[0], official[0]);
  const secondMatches = official.slice(1).some((tok) => tokenMatches(candidate[1], tok));

  if (firstMatches && secondMatches) {
    return true;
  }

  const matchedTokensCount = candidate.filter((cTok) =>
    official.some((oTok) => tokenMatches(cTok, oTok))
  ).length;

  return matchedTokensCount >= Math.min(candidate.length, 2);
}

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

  async getDepartments(): Promise<string[]> {
    const records = await this.prisma.hrEmployeeRoster.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });
    return records.map((r) => r.department).filter(Boolean);
  }

  async lookupByName(name: string, department?: string) {
    if (!name || !name.trim()) {
      throw new BadRequestException('Please enter your name to search.');
    }

    const trimmedName = name.trim();
    const whereClause: any = {
      employmentStatus: EmploymentStatus.ACTIVE,
    };

    if (department && department !== 'ALL' && department.trim()) {
      whereClause.department = department.trim();
    }

    const rosterList = await this.prisma.hrEmployeeRoster.findMany({
      where: whereClause,
      include: {
        userAccount: {
          select: { id: true, role: true, waiverSigned: true },
        },
      },
    });

    const matches = rosterList.filter((staff) =>
      isNameMatching(staff.fullName, trimmedName),
    );

    if (matches.length === 0) {
      const deptMsg = department && department !== 'ALL' ? ` in "${department}"` : '';
      throw new NotFoundException(
        `No active employee matching "${trimmedName}" was found${deptMsg}. Please verify spelling or select "All Directorates".`,
      );
    }

    return matches.map((roster) => ({
      employeeId: roster.employeeId,
      fullName: roster.fullName,
      department: roster.department,
      employmentStatus: roster.employmentStatus,
      isClaimed: !!roster.userAccount,
      waiverSigned: roster.userAccount?.waiverSigned ?? false,
    }));
  }

  async lookupRoster(employeeId: string, fullName?: string) {
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
      throw new NotFoundException(`Employee ID "${trimmed}" was not found in the MoA HR staff roster.`);
    }

    if (roster.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new ForbiddenException(`Employee "${trimmed}" has non-active status (${roster.employmentStatus}) in HR roster.`);
    }

    if (roster.userAccount) {
      throw new ConflictException(`An account for employee "${trimmed}" has already been claimed. Please sign in instead.`);
    }

    // Name verification check against HR roster
    if (fullName && fullName.trim()) {
      const matches = isNameMatching(roster.fullName, fullName.trim());
      if (!matches) {
        throw new BadRequestException(
          `The name entered does not match the official MoA HR record registered for Employee ID "${trimmed}". Please enter your official First and Father's name as recorded in HR.`,
        );
      }
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

    if (dto.fullName && dto.fullName.trim()) {
      const matches = isNameMatching(hrRecord.fullName, dto.fullName.trim());
      if (!matches) {
        throw new BadRequestException(
          `The name entered does not match the official MoA HR record registered for Employee ID "${trimmedId}".`,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        employeeId: trimmedId,
        passwordHash: hashedPassword,
        role: Role.STAFF_MEMBER,
        waiverSigned: true,
        waiverSignedAt: new Date(),
      },
      include: {
        hrRecord: true,
      },
    });

    // Ensure member is automatically enrolled into official GymRegistration directory
    const existingReg = await this.prisma.gymRegistration.findFirst({
      where: { employeeId: trimmedId },
    });

    if (!existingReg) {
      await this.prisma.gymRegistration.create({
        data: {
          employeeId: trimmedId,
          fullName: hrRecord.fullName,
          department: hrRecord.department,
          phone: hrRecord.phone,
          email: hrRecord.email,
          shiftPreference: dto.shiftPreference || 'MORNING',
          registrationSource: 'SELF_SERVICE',
          registeredBy: 'Self-Claim Intranet',
          status: 'ACTIVE',
          signatureConfirmed: true,
        },
      });
    } else if (dto.shiftPreference) {
      await this.prisma.gymRegistration.update({
        where: { id: existingReg.id },
        data: { shiftPreference: dto.shiftPreference },
      });
    }

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
