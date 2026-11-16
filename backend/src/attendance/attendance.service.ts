import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';
import { VerifyPassDto, CheckInDto, CheckOutDto } from './dto/verify-pass.dto';
import { LockerStatus, EmploymentStatus } from '@prisma/client';

export type GateVerificationStatus =
  | 'APPROVED'
  | 'READY_FOR_CHECKIN'
  | 'ALREADY_CHECKED_IN'
  | 'UNREGISTERED'
  | 'DENIED';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getOccupancy() {
    const [config, activeLogs] = await Promise.all([
      this.prisma.systemConfig.findFirst({ where: { id: 1 } }),
      this.prisma.attendance.findMany({
        where: { checkOutTime: null },
        include: {
          user: {
            include: { hrRecord: true },
          },
        },
        orderBy: { checkInTime: 'desc' },
      }),
    ]);

    const maxCapacity = config?.maxCapacity ?? 40;
    const current = activeLogs.length;
    const percentage = Math.min(100, Math.round((current / maxCapacity) * 100));

    return {
      current,
      maxCapacity,
      percentage,
      activeUsers: activeLogs.map((log) => ({
        attendanceId: log.id,
        userId: log.userId,
        employeeId: log.user.employeeId,
        fullName: log.user.hrRecord.fullName,
        department: log.user.hrRecord.department,
        photoUrl: log.user.hrRecord.photoUrl,
        checkInTime: log.checkInTime,
        lockerNumber: log.lockerNumber,
      })),
    };
  }

  async verifyEntrance(dto: VerifyPassDto) {
    let employeeId = dto.employeeId?.trim();

    // Step 1: Cryptographic QR Check if QR Token is supplied
    if (dto.qrToken) {
      try {
        const decoded: any = this.jwtService.verify(dto.qrToken);
        if (decoded.type !== 'GYM_PASS') {
          return {
            status: 'DENIED' as GateVerificationStatus,
            reason: 'INVALID_TOKEN_TYPE',
            message: 'Presented QR code is not a valid MoA Gym Entry Pass',
          };
        }
        employeeId = decoded.employeeId;
      } catch (err: any) {
        return {
          status: 'DENIED' as GateVerificationStatus,
          reason: 'EXPIRED_OR_INVALID_QR',
          message: 'The QR Entry Pass has expired or is invalid. Please refresh the pass on staff device.',
        };
      }
    }

    if (!employeeId) {
      return {
        status: 'DENIED' as GateVerificationStatus,
        reason: 'MISSING_IDENTIFIER',
        message: 'No QR pass or Employee ID provided for gate verification.',
      };
    }

    // Step 2: HR Whitelist Check
    const hrRecord = await this.prisma.hrEmployeeRoster.findUnique({
      where: { employeeId },
      include: {
        userAccount: {
          include: {
            attendanceLogs: {
              where: { checkOutTime: null },
              take: 1,
            },
          },
        },
      },
    });

    if (!hrRecord) {
      return {
        status: 'DENIED' as GateVerificationStatus,
        reason: 'NOT_FOUND_IN_ROSTER',
        message: `Employee ID "${employeeId}" was not found in the official MoA HR staff roster.`,
      };
    }

    if (hrRecord.employmentStatus !== EmploymentStatus.ACTIVE) {
      return {
        status: 'DENIED' as GateVerificationStatus,
        reason: 'NOT_ACTIVE_EMPLOYEE',
        employee: {
          employeeId: hrRecord.employeeId,
          fullName: hrRecord.fullName,
          department: hrRecord.department,
          photoUrl: hrRecord.photoUrl,
          employmentStatus: hrRecord.employmentStatus,
        },
        message: `Gym access denied: Employee employment status is "${hrRecord.employmentStatus}".`,
      };
    }

    // Step 3: Account Claim Check
    if (!hrRecord.userAccount) {
      return {
        status: 'UNREGISTERED' as GateVerificationStatus,
        reason: 'ACCOUNT_NOT_CLAIMED',
        employee: {
          employeeId: hrRecord.employeeId,
          fullName: hrRecord.fullName,
          department: hrRecord.department,
          photoUrl: hrRecord.photoUrl,
          employmentStatus: hrRecord.employmentStatus,
        },
        message: 'Employee is verified active on HR roster but has not yet claimed their digital account.',
      };
    }

    const user = hrRecord.userAccount;

    // Step 4: Waiver Compliance Check
    if (!user.waiverSigned) {
      return {
        status: 'DENIED' as GateVerificationStatus,
        reason: 'WAIVER_NOT_SIGNED',
        employee: {
          employeeId: hrRecord.employeeId,
          fullName: hrRecord.fullName,
          department: hrRecord.department,
          photoUrl: hrRecord.photoUrl,
        },
        message: 'Mandatory PAR-Q health screening & liability waiver has not been submitted.',
      };
    }

    // Step 5: Duplicate Check & Capacity Check
    const activeSession = user.attendanceLogs[0];
    if (activeSession) {
      return {
        status: 'ALREADY_CHECKED_IN' as GateVerificationStatus,
        reason: 'ALREADY_CHECKED_IN',
        activeAttendance: {
          id: activeSession.id,
          checkInTime: activeSession.checkInTime,
          lockerNumber: activeSession.lockerNumber,
        },
        employee: {
          employeeId: hrRecord.employeeId,
          fullName: hrRecord.fullName,
          department: hrRecord.department,
          photoUrl: hrRecord.photoUrl,
        },
        message: `Employee already checked in at ${new Date(activeSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      };
    }

    const [activeCount, config, availableLockers] = await Promise.all([
      this.prisma.attendance.count({ where: { checkOutTime: null } }),
      this.prisma.systemConfig.findFirst({ where: { id: 1 } }),
      this.prisma.locker.findMany({
        where: { status: LockerStatus.AVAILABLE },
        orderBy: { lockerNumber: 'asc' },
      }),
    ]);

    const maxCapacity = config?.maxCapacity ?? 40;
    if (activeCount >= maxCapacity) {
      return {
        status: 'DENIED' as GateVerificationStatus,
        reason: 'GYM_AT_MAX_CAPACITY',
        currentOccupancy: activeCount,
        maxCapacity,
        employee: {
          employeeId: hrRecord.employeeId,
          fullName: hrRecord.fullName,
          department: hrRecord.department,
          photoUrl: hrRecord.photoUrl,
        },
        message: `Facility is currently full (${activeCount}/${maxCapacity} active staff). Please wait until someone checks out.`,
      };
    }

    // Step 6: Ready for Physical Identity Confirmation & Check-In
    return {
      status: 'READY_FOR_CHECKIN' as GateVerificationStatus,
      employee: {
        userId: user.id,
        employeeId: hrRecord.employeeId,
        fullName: hrRecord.fullName,
        department: hrRecord.department,
        photoUrl: hrRecord.photoUrl,
        waiverSignedAt: user.waiverSignedAt,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
      },
      availableLockers: availableLockers.map((l) => l.lockerNumber),
      currentOccupancy: activeCount,
      maxCapacity,
      message: 'All automated gate checks passed. Please visually match employee badge/photo and confirm entrance.',
    };
  }

  async checkIn(dto: CheckInDto, attendantId?: string) {
    const verification = await this.verifyEntrance({ employeeId: dto.employeeId });

    if (verification.status !== 'READY_FOR_CHECKIN') {
      throw new BadRequestException(verification.message || 'Cannot check in employee');
    }

    const user = await this.prisma.user.findUnique({
      where: { employeeId: dto.employeeId.trim() },
    });

    if (!user) {
      throw new NotFoundException('User account not found');
    }

    let assignedLocker = dto.lockerNumber?.trim() || null;
    if (assignedLocker) {
      const locker = await this.prisma.locker.findUnique({
        where: { lockerNumber: assignedLocker },
      });
      if (!locker || locker.status !== LockerStatus.AVAILABLE) {
        throw new ConflictException(`Locker ${assignedLocker} is not available`);
      }

      await this.prisma.locker.update({
        where: { lockerNumber: assignedLocker },
        data: {
          status: LockerStatus.OCCUPIED,
          assignedUserId: user.id,
        },
      });
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        userId: user.id,
        lockerNumber: assignedLocker,
        checkedInById: attendantId || null,
      },
      include: {
        user: {
          include: { hrRecord: true },
        },
      },
    });

    return {
      success: true,
      status: 'APPROVED',
      attendanceId: attendance.id,
      checkInTime: attendance.checkInTime,
      lockerNumber: attendance.lockerNumber,
      employee: {
        employeeId: attendance.user.employeeId,
        fullName: attendance.user.hrRecord.fullName,
        department: attendance.user.hrRecord.department,
        photoUrl: attendance.user.hrRecord.photoUrl,
      },
    };
  }

  async checkOut(dto: CheckOutDto) {
    const ident = dto.identifier.trim();

    // Find active attendance by attendance ID, user ID, or employee ID
    const activeLog = await this.prisma.attendance.findFirst({
      where: {
        checkOutTime: null,
        OR: [
          { id: ident },
          { userId: ident },
          { user: { employeeId: ident } },
        ],
      },
      include: {
        user: { include: { hrRecord: true } },
      },
    });

    if (!activeLog) {
      throw new NotFoundException(`No active check-in session found for "${ident}"`);
    }

    // Free locker if one was held
    if (activeLog.lockerNumber) {
      await this.prisma.locker.updateMany({
        where: { lockerNumber: activeLog.lockerNumber },
        data: {
          status: LockerStatus.AVAILABLE,
          assignedUserId: null,
        },
      });
    }

    const updated = await this.prisma.attendance.update({
      where: { id: activeLog.id },
      data: {
        checkOutTime: new Date(),
      },
    });

    return {
      success: true,
      attendanceId: updated.id,
      checkInTime: updated.checkInTime,
      checkOutTime: updated.checkOutTime,
      lockerReleased: activeLog.lockerNumber,
      employee: {
        employeeId: activeLog.user.employeeId,
        fullName: activeLog.user.hrRecord.fullName,
        department: activeLog.user.hrRecord.department,
      },
    };
  }

  @Cron('59 23 * * *')
  async handleNightlyAutoCheckout() {
    this.logger.log('Executing nightly 23:59 MoA Gym auto-checkout cron job...');

    const unclosedSessions = await this.prisma.attendance.findMany({
      where: { checkOutTime: null },
    });

    if (unclosedSessions.length === 0) {
      this.logger.log('No unclosed attendance sessions found. Floor occupancy is 0.');
      return;
    }

    const now = new Date();
    const count = unclosedSessions.length;

    await this.prisma.attendance.updateMany({
      where: { checkOutTime: null },
      data: {
        checkOutTime: now,
        autoClosed: true,
      },
    });

    // Reset any lockers assigned to these sessions
    await this.prisma.locker.updateMany({
      where: { status: LockerStatus.OCCUPIED },
      data: {
        status: LockerStatus.AVAILABLE,
        assignedUserId: null,
      },
    });

    this.logger.warn(`Nightly cron automatically closed ${count} sessions and cleared active lockers.`);
  }
}
