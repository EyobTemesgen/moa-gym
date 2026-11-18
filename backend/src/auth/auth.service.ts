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
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterStaffDto } from './dto/register.dto';
import { EmploymentStatus, Role, LockerStatus } from '@prisma/client';

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

    // Find by username, exact employeeId, or email in hrRecord
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: trimmed, mode: 'insensitive' } },
          { employeeId: trimmed },
          { hrRecord: { email: { equals: trimmed, mode: 'insensitive' } } },
        ],
      },
      include: {
        hrRecord: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid username, Employee ID, or password');
    }

    if (user.hrRecord.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new ForbiddenException('Access denied: Employee status is not active in HR records');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid username, Employee ID, or password');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUserByIdentifier(dto.identifier, dto.password);

    const payload = {
      sub: user.id,
      employeeId: user.employeeId,
      username: user.username,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        username: user.username,
        fullName: user.hrRecord.fullName,
        department: user.hrRecord.department,
        email: user.hrRecord.email,
        photoUrl: user.hrRecord.photoUrl,
        role: user.role,
        memberType: user.memberType,
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

  async resetOrChangePassword(dto: ResetPasswordDto) {
    const trimmedId = dto.identifier.trim();
    const newPwd = dto.newPassword.trim();

    if (!trimmedId) {
      throw new BadRequestException('Enter your username, Employee ID, or registered email.');
    }
    if (!newPwd || newPwd.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters.');
    }

    // Find user by username, employeeId, or email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: trimmedId, mode: 'insensitive' } },
          { employeeId: trimmedId },
          { hrRecord: { email: { equals: trimmedId, mode: 'insensitive' } } },
        ],
      },
      include: { hrRecord: true },
    });

    if (!user) {
      throw new NotFoundException(`No account found matching "${trimmedId}". Please verify your credentials or register first.`);
    }

    if (user.hrRecord.employmentStatus !== EmploymentStatus.ACTIVE) {
      throw new ForbiddenException('Access denied: Employee status is not active in HR records');
    }

    // Two verification paths matching ATS standard:
    // 1. Current / temporary password verification
    // 2. Email verification (if user forgot current password completely)
    if (dto.currentPassword && dto.currentPassword.trim()) {
      const isMatch = await bcrypt.compare(dto.currentPassword.trim(), user.passwordHash);
      if (!isMatch) {
        throw new BadRequestException('Current / temporary password is incorrect.');
      }
    } else if (dto.email && dto.email.trim()) {
      const emailInput = dto.email.trim().toLowerCase();
      const officialEmail = (user.hrRecord.email || '').trim().toLowerCase();
      if (!officialEmail || emailInput !== officialEmail) {
        throw new BadRequestException(
          'The provided email does not match the official registered email for this employee in HR records.',
        );
      }
    } else {
      throw new BadRequestException(
        'Please provide either your current/temporary password or your registered work email for verification.',
      );
    }

    const newHash = await bcrypt.hash(newPwd, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return {
      success: true,
      message: `Password updated successfully for ${user.hrRecord.fullName}. You can now sign in with your new password.`,
      employeeId: user.employeeId,
      fullName: user.hrRecord.fullName,
    };
  }

  async getAvailableLockers() {
    const lockers = await this.prisma.locker.findMany({
      orderBy: { lockerNumber: 'asc' },
      select: {
        id: true,
        lockerNumber: true,
        status: true,
      },
    });
    return lockers;
  }

  async checkAvailability(query: { username?: string; employeeId?: string; email?: string }) {
    const rawUsername = query.username?.trim();
    const normalizedUsername = rawUsername ? rawUsername.toLowerCase() : null;
    const employeeId = query.employeeId?.trim();
    const email = query.email?.trim().toLowerCase();

    const orConditions: any[] = [];
    if (normalizedUsername) {
      orConditions.push({ username: normalizedUsername });
    }
    if (employeeId) {
      orConditions.push({ employeeId });
    }
    if (email) {
      orConditions.push({ hrRecord: { email } });
    }

    if (orConditions.length === 0) {
      return { available: true };
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: orConditions },
      include: { hrRecord: true },
    });

    if (existingUser) {
      if (normalizedUsername && existingUser.username?.toLowerCase() === normalizedUsername) {
        return {
          available: false,
          conflictField: 'username',
          message: `The username "${rawUsername}" is already taken. Please choose another username.`,
        };
      }
      return {
        available: false,
        conflictField: existingUser.employeeId === employeeId ? 'employeeId' : 'email',
        message: `An account already exists for ${existingUser.hrRecord.fullName} (${existingUser.employeeId}). Please sign in instead.`,
        employeeId: existingUser.employeeId,
        username: existingUser.username,
        fullName: existingUser.hrRecord.fullName,
      };
    }

    return { available: true };
  }

  calculateGymFee(memberType: 'INTERNAL' | 'EXTERNAL', daysPerWeek: number): number {
    if (memberType === 'INTERNAL') {
      return 0; // 100% Free institutional wellness benefit for MoA civil servants
    }
    const days = Math.min(Math.max(daysPerWeek || 3, 1), 6);
    // External community / corporate rate (ETB/month)
    if (days <= 2) return 800;
    if (days === 3) return 1200;
    if (days === 4) return 1600;
    return 2200; // 5 or 6 days / Full Access
  }

  async register(dto: RegisterStaffDto) {
    const memberType = dto.memberType === 'EXTERNAL' ? 'EXTERNAL' : 'INTERNAL';
    const fullName = `${dto.firstName.trim()} ${dto.lastName.trim()}`;
    const email = dto.email.trim().toLowerCase();
    const phone = (dto.phone || '').trim();
    const daysPerWeek = Number(dto.daysPerWeek) || 3;
    const workoutDays = Array.isArray(dto.workoutDays)
      ? dto.workoutDays.join(',')
      : dto.workoutDays || 'MON,WED,FRI';
    const monthlyFee = this.calculateGymFee(memberType, daysPerWeek);

    const rawUsername = dto.username?.trim();
    const normalizedUsername = rawUsername ? rawUsername.toLowerCase() : null;

    // Resolve or generate Employee ID / External Member ID
    let employeeId = (dto.employeeId || '').trim();
    if (!employeeId) {
      const randNum = Math.floor(1000 + Math.random() * 9000);
      employeeId = memberType === 'INTERNAL' ? `EMP-MOA-${randNum}` : `EXT-MOA-${randNum}`;
    }

    // Check if an active account already exists for this ID, Email, or Username
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
          { employeeId },
          { hrRecord: { email } },
        ],
      },
      include: { hrRecord: true },
    });

    if (existingUser) {
      if (normalizedUsername && existingUser.username?.toLowerCase() === normalizedUsername) {
        throw new ConflictException(
          `The username "${rawUsername}" is already taken. Please choose another username.`,
        );
      }
      throw new ConflictException(
        `An account already exists for ${existingUser.hrRecord.fullName} (${existingUser.employeeId}). Please sign in instead.`,
      );
    }

    const departmentName = memberType === 'EXTERNAL'
      ? (dto.organization ? `External - ${dto.organization.trim()}` : (dto.department?.trim() || 'Community Trainee'))
      : (dto.department?.trim() || 'General Ministry Staff');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Atomic transaction across HR, User, Locker, and GymRegistration
    const { newUser, newRegistration } = await this.prisma.$transaction(async (tx) => {
      // 1. Ensure HR roster record exists
      const existingRoster = await tx.hrEmployeeRoster.findUnique({
        where: { employeeId },
      });

      if (!existingRoster) {
        await tx.hrEmployeeRoster.create({
          data: {
            employeeId,
            fullName,
            department: departmentName,
            phone: phone || '+251 90 000 0000',
            email,
            photoUrl: dto.photoUrl?.trim() || null,
            employmentStatus: EmploymentStatus.ACTIVE,
          },
        });
      } else {
        await tx.hrEmployeeRoster.update({
          where: { employeeId },
          data: {
            email,
            ...(phone ? { phone } : {}),
            ...(dto.photoUrl?.trim() ? { photoUrl: dto.photoUrl.trim() } : {}),
          },
        });
      }

      // 2. Create User record
      const createdUser = await tx.user.create({
        data: {
          employeeId,
          username: normalizedUsername,
          passwordHash: hashedPassword,
          role: Role.STAFF_MEMBER,
          memberType,
          waiverSigned: true,
          waiverSignedAt: new Date(),
          emergencyContactName: dto.emergencyContactName?.trim() || null,
          emergencyContactPhone: dto.emergencyContactPhone?.trim() || null,
        },
        include: { hrRecord: true },
      });

      // 3. Handle locker assignment if requested
      let assignedLocker: string | null = null;
      if (dto.lockerNumber && dto.lockerNumber.trim()) {
        const targetLocker = await tx.locker.findUnique({
          where: { lockerNumber: dto.lockerNumber.trim() },
        });
        if (targetLocker && targetLocker.status === LockerStatus.AVAILABLE) {
          await tx.locker.update({
            where: { lockerNumber: targetLocker.lockerNumber },
            data: {
              status: LockerStatus.OCCUPIED,
              assignedUserId: createdUser.id,
            },
          });
          assignedLocker = targetLocker.lockerNumber;
        }
      }

      // 4. Create or Update GymRegistration record with safe sequential regNumber
      const existingReg = await tx.gymRegistration.findFirst({
        where: { employeeId },
      });

      let regRecord;
      if (existingReg) {
        regRecord = await tx.gymRegistration.update({
          where: { id: existingReg.id },
          data: {
            fullName,
            department: departmentName,
            phone: phone || existingReg.phone,
            email: email || existingReg.email,
            gender: dto.gender || existingReg.gender,
            shiftPreference: dto.shiftPreference || existingReg.shiftPreference,
            memberType,
            organization: dto.organization?.trim() || (memberType === 'INTERNAL' ? 'Ministry of Agriculture' : null),
            daysPerWeek,
            workoutDays,
            monthlyFee,
            paymentMethod: memberType === 'INTERNAL' ? 'GOVERNMENT_BENEFIT' : (dto.paymentMethod || existingReg.paymentMethod || 'TELEBIRR'),
            fitnessGoal: dto.fitnessGoal?.trim() || existingReg.fitnessGoal,
            lockerNumber: assignedLocker || existingReg.lockerNumber,
            status: 'ACTIVE',
            signatureConfirmed: true,
          },
        });
      } else {
        const maxReg = await tx.gymRegistration.findFirst({
          orderBy: { regNumber: 'desc' },
          select: { regNumber: true },
        });
        const nextRegNumber = (maxReg?.regNumber || 0) + 1;

        regRecord = await tx.gymRegistration.create({
          data: {
            regNumber: nextRegNumber,
            employeeId,
            fullName,
            department: departmentName,
            phone,
            email,
            gender: dto.gender || null,
            shiftPreference: dto.shiftPreference || 'MORNING',
            memberType,
            organization: dto.organization?.trim() || (memberType === 'INTERNAL' ? 'Ministry of Agriculture' : null),
            daysPerWeek,
            workoutDays,
            monthlyFee,
            paymentMethod: memberType === 'INTERNAL' ? 'GOVERNMENT_BENEFIT' : (dto.paymentMethod || 'TELEBIRR'),
            fitnessGoal: dto.fitnessGoal?.trim() || null,
            lockerNumber: assignedLocker,
            registrationSource: 'SELF_SERVICE',
            registeredBy: 'Self-Serve Portal',
            status: 'ACTIVE',
            signatureConfirmed: true,
          },
        });
      }

      return { newUser: createdUser, newRegistration: regRecord };
    });

    // Create JWT Session
    const payload = {
      sub: newUser.id,
      employeeId: newUser.employeeId,
      username: newUser.username,
      role: newUser.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: newUser.id,
        employeeId: newUser.employeeId,
        username: newUser.username,
        fullName: newUser.hrRecord.fullName,
        department: newUser.hrRecord.department,
        email: newUser.hrRecord.email,
        photoUrl: newUser.hrRecord.photoUrl,
        role: newUser.role,
        memberType,
        waiverSigned: newUser.waiverSigned,
      },
      registration: {
        id: newRegistration.id,
        regNumber: newRegistration.regNumber,
        memberType: newRegistration.memberType,
        shiftPreference: newRegistration.shiftPreference,
        daysPerWeek: newRegistration.daysPerWeek,
        monthlyFee: newRegistration.monthlyFee,
        lockerNumber: newRegistration.lockerNumber,
        paymentMethod: newRegistration.paymentMethod,
      },
    };
  }
}
