import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
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
}
