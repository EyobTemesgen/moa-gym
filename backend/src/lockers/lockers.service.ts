import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LockerStatus } from '@prisma/client';

@Injectable()
export class LockersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const lockers = await this.prisma.locker.findMany({
      orderBy: { lockerNumber: 'asc' },
    });

    // Enrich with active user details if assigned
    const userIds = lockers.map((l) => l.assignedUserId).filter(Boolean) as string[];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      include: { hrRecord: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return lockers.map((l) => {
      const assignedUser = l.assignedUserId ? userMap.get(l.assignedUserId) : null;
      return {
        id: l.id,
        lockerNumber: l.lockerNumber,
        status: l.status,
        assignedUser: assignedUser
          ? {
              userId: assignedUser.id,
              employeeId: assignedUser.employeeId,
              fullName: assignedUser.hrRecord.fullName,
              department: assignedUser.hrRecord.department,
            }
          : null,
      };
    });
  }

  async updateStatus(lockerNumber: string, status: LockerStatus) {
    const locker = await this.prisma.locker.findUnique({
      where: { lockerNumber },
    });
    if (!locker) {
      throw new NotFoundException(`Locker ${lockerNumber} not found`);
    }

    return this.prisma.locker.update({
      where: { lockerNumber },
      data: {
        status,
        assignedUserId: status === LockerStatus.AVAILABLE ? null : locker.assignedUserId,
      },
    });
  }

  async forceRelease(lockerNumber: string) {
    const locker = await this.prisma.locker.findUnique({
      where: { lockerNumber },
    });
    if (!locker) {
      throw new NotFoundException(`Locker ${lockerNumber} not found`);
    }

    return this.prisma.locker.update({
      where: { lockerNumber },
      data: {
        status: LockerStatus.AVAILABLE,
        assignedUserId: null,
      },
    });
  }
}
