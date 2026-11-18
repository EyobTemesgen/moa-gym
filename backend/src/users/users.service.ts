import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role, EmploymentStatus } from '@prisma/client';
import { SubmitWaiverDto } from './dto/waiver.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        hrRecord: true,
        attendanceLogs: {
          where: { checkOutTime: null },
          orderBy: { checkInTime: 'desc' },
          take: 1,
        },
        classBookings: {
          include: { class: true },
          where: {
            class: {
              scheduledDate: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          },
          orderBy: { class: { scheduledDate: 'asc' } },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeSession = user.attendanceLogs[0] || null;

    const gymReg = await this.prisma.gymRegistration.findFirst({
      where: { employeeId: user.employeeId },
    });

    return {
      id: user.id,
      employeeId: user.employeeId,
      fullName: user.hrRecord.fullName,
      department: user.hrRecord.department,
      phone: user.hrRecord.phone,
      email: user.hrRecord.email,
      photoUrl: user.hrRecord.photoUrl,
      role: user.role,
      regNumber: gymReg?.regNumber ?? null,
      shiftPreference: gymReg?.shiftPreference ?? 'Flexible',
      gymStatus: gymReg?.status ?? 'ACTIVE',
      gymRegisteredAt: gymReg?.registeredAt ?? null,
      waiverSigned: user.waiverSigned,
      waiverSignedAt: user.waiverSignedAt,
      emergencyContactName: user.emergencyContactName,
      emergencyContactPhone: user.emergencyContactPhone,
      activeSession: activeSession
        ? {
            id: activeSession.id,
            checkInTime: activeSession.checkInTime,
            lockerNumber: activeSession.lockerNumber,
          }
        : null,
      upcomingClasses: user.classBookings.map((b) => ({
        bookingId: b.id,
        classId: b.classId,
        title: b.class.title,
        instructor: b.class.instructorName,
        date: b.class.scheduledDate,
        startTime: b.class.startTime,
        endTime: b.class.endTime,
      })),
    };
  }

  async submitWaiver(userId: string, dto: SubmitWaiverDto) {
    if (!dto.agreedToTerms) {
      throw new BadRequestException('You must agree to the liability waiver terms');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        waiverSigned: true,
        waiverSignedAt: new Date(),
        parqResponses: dto.parqResponses as any,
        emergencyContactName: dto.emergencyContactName.trim(),
        emergencyContactPhone: dto.emergencyContactPhone.trim(),
      },
      include: { hrRecord: true },
    });

    return {
      success: true,
      waiverSigned: true,
      waiverSignedAt: updated.waiverSignedAt,
      message: 'Onboarding health screening and waiver successfully recorded',
    };
  }

  async generateQrPassToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { hrRecord: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.waiverSigned) {
      throw new BadRequestException('Waiver must be completed before generating an entry pass');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresInSeconds = 60; // short lived token
    const refreshSeconds = 45; // frontend asks every 45s

    const payload = {
      sub: user.id,
      userId: user.id,
      employeeId: user.employeeId,
      fullName: user.hrRecord.fullName,
      department: user.hrRecord.department,
      photoUrl: user.hrRecord.photoUrl,
      type: 'GYM_PASS',
      iat: now,
      exp: now + expiresInSeconds,
    };

    const token = this.jwtService.sign(payload);

    return {
      passToken: token,
      expiresAt: (now + expiresInSeconds) * 1000,
      refreshIntervalMs: refreshSeconds * 1000,
      employee: {
        employeeId: user.employeeId,
        fullName: user.hrRecord.fullName,
        department: user.hrRecord.department,
        photoUrl: user.hrRecord.photoUrl,
      },
    };
  }

  // --- Admin User Management Operations ---

  async listUsers(params: {
    query?: string;
    role?: Role;
    status?: EmploymentStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const where: any = {};

    if (params.role) {
      where.role = params.role;
    }

    if (params.status) {
      where.hrRecord = { employmentStatus: params.status };
    }

    if (params.query) {
      const q = params.query.trim();
      where.OR = [
        { employeeId: { contains: q, mode: 'insensitive' } },
        { hrRecord: { fullName: { contains: q, mode: 'insensitive' } } },
        { hrRecord: { department: { contains: q, mode: 'insensitive' } } },
        { hrRecord: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          hrRecord: true,
          attendanceLogs: {
            orderBy: { checkInTime: 'desc' },
            take: 1,
          },
        },
        orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      employeeId: u.employeeId,
      fullName: u.hrRecord.fullName,
      department: u.hrRecord.department,
      phone: u.hrRecord.phone,
      email: u.hrRecord.email,
      photoUrl: u.hrRecord.photoUrl,
      role: u.role,
      status: u.hrRecord.employmentStatus,
      waiverSigned: u.waiverSigned,
      createdAt: u.createdAt,
      lastActive: u.attendanceLogs[0]?.checkInTime || null,
    }));

    return {
      items: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, role: Role, currentAdminId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { hrRecord: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === currentAdminId && role !== Role.ADMIN) {
      const adminCount = await this.prisma.user.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the only remaining administrator');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { hrRecord: true },
    });

    return {
      success: true,
      message: `Role for ${updated.hrRecord.fullName} updated to ${role}`,
      user: {
        id: updated.id,
        employeeId: updated.employeeId,
        fullName: updated.hrRecord.fullName,
        role: updated.role,
      },
    };
  }

  async updateUserStatus(userId: string, status: EmploymentStatus, actorId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.employeeId === 'EMP-ADM-01' && status !== EmploymentStatus.ACTIVE) {
      throw new BadRequestException('The primary system administrator (EMP-ADM-01) cannot be suspended.');
    }

    if (actorId && actorId === userId && status !== EmploymentStatus.ACTIVE) {
      throw new BadRequestException('You cannot suspend your own active administrator account.');
    }

    await this.prisma.hrEmployeeRoster.update({
      where: { employeeId: user.employeeId },
      data: { employmentStatus: status },
    });

    return {
      success: true,
      message: `Account status for ${user.employeeId} set to ${status}`,
      status,
    };
  }

  async resetUserPassword(userId: string, newPassword?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { hrRecord: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pwd = newPassword?.trim() || 'Password123!';
    const passwordHash = await bcrypt.hash(pwd, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return {
      success: true,
      message: `Password for ${user.hrRecord.fullName} (${user.employeeId}) reset to default (Password123!)`,
    };
  }

  async getAddUserCandidates() {
    const employees = await this.prisma.hrEmployeeRoster.findMany({
      where: { employmentStatus: EmploymentStatus.ACTIVE },
      include: {
        userAccount: {
          select: { id: true, role: true },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return employees.map((e) => ({
      employeeId: e.employeeId,
      fullName: e.fullName,
      department: e.department,
      phone: e.phone,
      email: e.email,
      photoUrl: e.photoUrl,
      isUser: !!e.userAccount,
      currentRole: e.userAccount?.role || null,
    }));
  }

  async provisionUser(employeeId: string, role: Role, password?: string) {
    const hrRecord = await this.prisma.hrEmployeeRoster.findUnique({
      where: { employeeId },
    });
    if (!hrRecord) {
      throw new NotFoundException(`Employee ${employeeId} not found on HR roster`);
    }

    const pwd = password?.trim() || 'Password123!';
    const passwordHash = await bcrypt.hash(pwd, 10);
    const user = await this.prisma.user.upsert({
      where: { employeeId },
      update: {
        role,
        passwordHash,
      },
      create: {
        employeeId,
        passwordHash,
        role,
        waiverSigned: true,
        waiverSignedAt: new Date(),
      },
      include: { hrRecord: true },
    });

    return {
      success: true,
      message: `User ${hrRecord.fullName} (${employeeId}) granted access as ${role}.`,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        fullName: user.hrRecord.fullName,
        role: user.role,
        status: user.hrRecord.employmentStatus,
      },
    };
  }
}
